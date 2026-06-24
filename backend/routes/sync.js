const express = require("express");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
const router = express.Router();
const {
  SYNC_COLLECTIONS,
  parseDate,
  resolveCollections,
  normalizeCollectionPayload,
  applyUploadedChanges,
  fetchDeltaChanges,
  fetchPendingChanges,
  markRecordsSynced,
} = require("../sync/syncService");
const { SYNC_MODELS } = require("../sync/modelRegistry");
const { runAutoSyncCycle, getAutoSyncState } = require("../sync/autoSyncService");

router.get("/collections", (_req, res) => {
  res.json({ collections: SYNC_COLLECTIONS });
});

router.get("/status", (_req, res) => {
  res.json(getAutoSyncState());
});

// Upload delta changes to this node (used by local -> cloud and cloud -> local replication).
router.post("/upload", async (req, res) => {
  try {
    const normalizedCollections = normalizeCollectionPayload(req.body);
    const hasPayload = Object.values(normalizedCollections).some(
      (records) => Array.isArray(records) && records.length > 0
    );

    if (!hasPayload) {
      return res.status(400).json({
        message: "No records provided. Send data in { collections } or { records } format.",
      });
    }

    const selectedCollections = resolveCollections(req.body.collectionsList || Object.keys(normalizedCollections));
    const result = await applyUploadedChanges(
      { collections: normalizedCollections },
      {
        collections: selectedCollections,
        // Received records are considered synced on this node after successful apply.
        markSynced: true,
      }
    );

    return res.status(200).json({
      message: "Upload sync completed",
      serverTime: new Date().toISOString(),
      collections: selectedCollections,
      summary: result.summary,
      results: result.results,
    });
  } catch (error) {
    console.error("Sync upload failed:", error);
    return res.status(500).json({ message: "Upload sync failed", error: error.message });
  }
});

// Download delta changes based on lastSync timestamp.
router.get("/download", async (req, res) => {
  try {
    const { lastSync, collections, limit } = req.query;

    if (lastSync && !parseDate(lastSync)) {
      return res.status(400).json({ message: "Invalid lastSync timestamp" });
    }

    const result = await fetchDeltaChanges({
      lastSync,
      collections,
      limit,
    });

    return res.status(200).json({
      message: "Download sync data ready",
      serverTime: new Date().toISOString(),
      lastSync: result.lastSync ? result.lastSync.toISOString() : null,
      limit: result.limit,
      totalRecords: result.totalRecords,
      collections: result.collections,
    });
  } catch (error) {
    console.error("Sync download failed:", error);
    return res.status(500).json({ message: "Download sync failed", error: error.message });
  }
});

// Local helper endpoint: read unsynced records for push phase.
router.get("/pending", async (req, res) => {
  try {
    const { collections, limit } = req.query;

    const result = await fetchPendingChanges({
      collections,
      limit,
    });

    return res.status(200).json({
      message: "Pending changes fetched",
      serverTime: new Date().toISOString(),
      limit: result.limit,
      totalRecords: result.totalRecords,
      collections: result.collections,
    });
  } catch (error) {
    console.error("Pending sync fetch failed:", error);
    return res.status(500).json({ message: "Pending sync fetch failed", error: error.message });
  }
});

// Local helper endpoint: mark records synced after remote upload succeeds.
router.post("/mark-synced", async (req, res) => {
  try {
    const result = await markRecordsSynced(req.body);

    return res.status(200).json({
      message: "Records marked as synced",
      serverTime: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("Mark synced failed:", error);
    return res.status(500).json({ message: "Mark synced failed", error: error.message });
  }
});

// Run one full bidirectional cycle: local -> cloud, then cloud -> local.
router.post("/run", async (req, res) => {
  try {
    const cycle = await runAutoSyncCycle({
      trigger: req.body?.trigger || "api",
      forceBootstrap: Boolean(req.body?.forceBootstrap),
      remoteUrl: req.body?.remoteUrl,
      collections: req.body?.collections,
    });

    if (cycle.ok) {
      return res.status(200).json(cycle);
    }

    if (cycle.skipped) {
      return res.status(202).json(cycle);
    }

    return res.status(500).json(cycle);
  } catch (error) {
    console.error("Sync run failed:", error);
    return res.status(500).json({ message: "Sync run failed", error: error.message });
  }
});

// Manual first-time bootstrap: pull full remote dataset and apply locally.
router.post("/bootstrap", async (req, res) => {
  try {
    const remoteBaseUrl = String(
      req.body?.remoteUrl || process.env.SYNC_REMOTE_URL || ""
    )
      .trim()
      .replace(/\/$/, "");

    if (!remoteBaseUrl) {
      return res.status(400).json({
        message: "remoteUrl is required (or configure SYNC_REMOTE_URL in backend/.env)",
      });
    }

    const remoteResponse = await fetch(`${remoteBaseUrl}/sync/download`);
    if (!remoteResponse.ok) {
      const errorBody = await remoteResponse.text();
      return res.status(502).json({
        message: "Failed to fetch remote sync download",
        status: remoteResponse.status,
        error: errorBody,
      });
    }

    const remotePayload = await remoteResponse.json();
    if (!remotePayload || typeof remotePayload !== "object" || !remotePayload.collections) {
      return res.status(502).json({ message: "Invalid remote sync payload" });
    }

    const result = await applyUploadedChanges(
      { collections: remotePayload.collections },
      { markSynced: true }
    );

    return res.status(200).json({
      message: "Bootstrap sync completed",
      remoteBaseUrl,
      serverTime: new Date().toISOString(),
      summary: result.summary,
    });
  } catch (error) {
    console.error("Bootstrap sync failed:", error);
    return res.status(500).json({ message: "Bootstrap sync failed", error: error.message });
  }
});

// Manual bootstrap directly from Atlas/cloud MongoDB into local DB.
router.post("/bootstrap-from-atlas", async (req, res) => {
  let sourceClient;

  try {
    const sourceUri = String(req.body?.sourceUri || process.env.MONGO_URI || "").trim();
    const sourceDbName = String(
      req.body?.sourceDbName || process.env.SYNC_SOURCE_DB_NAME || "test"
    ).trim();
    const collections = resolveCollections(req.body?.collections);

    if (!sourceUri) {
      return res.status(400).json({
        message: "sourceUri is required (or configure MONGO_URI in backend/.env)",
      });
    }

    sourceClient = new MongoClient(sourceUri, {
      serverSelectionTimeoutMS: 10000,
    });
    await sourceClient.connect();

    const sourceDb = sourceClient.db(sourceDbName);
    const payload = { collections: {} };
    const sourceCounts = {};

    for (const logicalCollection of collections) {
      const model = SYNC_MODELS[logicalCollection];
      if (!model) {
        continue;
      }

      const sourceCollectionName = model.collection.name;
      const records = await sourceDb.collection(sourceCollectionName).find({}).toArray();

      sourceCounts[logicalCollection] = records.length;
      payload.collections[logicalCollection] = records.map((record) => ({
        ...record,
        isDeleted: typeof record.isDeleted === "boolean" ? record.isDeleted : false,
        updatedAt: record.updatedAt || record.createdAt || new Date(),
        synced: true,
      }));
    }

    const result = await applyUploadedChanges(payload, {
      collections,
      markSynced: true,
    });

    return res.status(200).json({
      message: "Atlas bootstrap completed",
      sourceDbName,
      serverTime: new Date().toISOString(),
      sourceCounts,
      summary: result.summary,
    });
  } catch (error) {
    console.error("Bootstrap from Atlas failed:", error);
    return res.status(500).json({
      message: "Bootstrap from Atlas failed",
      error: error.message,
    });
  } finally {
    if (sourceClient) {
      await sourceClient.close();
    }
  }
});

// --- Simplified Sync Endpoints for Desktop Launcher ---

// Get all items from a collection for simple mirroring
router.get("/get-latest/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const model = SYNC_MODELS[collection];

    if (!model) {
      return res.status(404).json({ message: `Collection ${collection} not found for sync` });
    }

    const items = await model.find({}).lean();
    res.json({ items });
  } catch (error) {
    console.error(`Fetch failed for ${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Receive student reports from school nodes
router.post("/upload-reports", async (req, res) => {
  try {
    const { reports } = req.body;
    if (!Array.isArray(reports)) {
      return res.status(400).json({ message: "Invalid reports payload" });
    }

    const StudentReport = SYNC_MODELS.studentreports;
    
    let imported = 0;
    for (const report of reports) {
      await StudentReport.updateOne(
        { _id: report._id },
        { $set: { ...report, synced: true } },
        { upsert: true }
      );
      imported++;
    }

    res.json({ message: "Reports uploaded successfully", count: imported });
  } catch (error) {
    console.error("Report upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
