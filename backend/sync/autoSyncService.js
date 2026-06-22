const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
const {
  fetchPendingChanges,
  markRecordsSynced,
  applyUploadedChanges,
  resolveCollections,
  parseDate,
} = require("./syncService");
const { SYNC_MODELS } = require("./modelRegistry");
const { syncCloudMediaToLocal } = require("./mediaSyncService");
const { repairAllLocalAuthPasswordsFromAtlas } = require("./authPasswordRepair");

const DATA_DIR = path.join(__dirname, "..", "data");
const STATE_FILE = path.join(DATA_DIR, "sync-state.json");

const AUTO_SYNC_ENABLED = String(process.env.SYNC_AUTO_ENABLED || "true").toLowerCase() !== "false";
const AUTO_SYNC_INTERVAL_MS = Number(process.env.SYNC_AUTO_INTERVAL_MS || 1_200_000);
const AUTO_SYNC_START_DELAY_MS = Number(process.env.SYNC_AUTO_START_DELAY_MS || 5_000);
const REMOTE_TIMEOUT_MS = Number(process.env.SYNC_REMOTE_TIMEOUT_MS || 10_000);
const ATLAS_DELTA_LIMIT = Number(process.env.SYNC_INCREMENTAL_LIMIT || 500);
const ALLOW_LOOPBACK_REMOTE_API =
  String(process.env.SYNC_ALLOW_LOOPBACK_REMOTE_API || "false").toLowerCase() === "true";

let autoSyncInterval = null;
let cycleInProgress = false;

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readStateFromDisk() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return null;
    }

    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (_error) {
    return null;
  }
}

function writeStateToDisk(state) {
  try {
    ensureDataDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("Failed to persist sync state:", error.message);
  }
}

const runtimeState = {
  status: "idle",
  lastRunAt: null,
  lastSuccessAt: null,
  lastSync: null,
  lastError: null,
  inProgress: false,
  ...(readStateFromDisk() || {}),
};

function updateState(patch) {
  Object.assign(runtimeState, patch);
  writeStateToDisk(runtimeState);
}

function getAutoSyncState() {
  return {
    ...runtimeState,
    inProgress: cycleInProgress,
    autoSyncEnabled: AUTO_SYNC_ENABLED,
    intervalMs: AUTO_SYNC_INTERVAL_MS,
    remoteUrl: process.env.SYNC_REMOTE_URL || null,
    nodeRole: process.env.SYNC_NODE_ROLE || "local",
  };
}

function normalizeRemoteUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

function shouldIgnoreLoopbackRemote(remoteBaseUrl) {
  const normalized = normalizeRemoteUrl(remoteBaseUrl);
  if (!normalized || ALLOW_LOOPBACK_REMOTE_API) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    const hostname = String(parsed.hostname || "").toLowerCase();

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.startsWith("127.")
    );
  } catch (_error) {
    return false;
  }
}

function hasAnyRecords(collections = {}) {
  return Object.values(collections).some((records) => Array.isArray(records) && records.length > 0);
}

function toQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REMOTE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorBody}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildMarkSyncedPayload(results = []) {
  const idsByCollection = {};

  results
    .filter((entry) => entry && entry.status !== "failed" && entry.collection && entry.id)
    .forEach((entry) => {
      if (!idsByCollection[entry.collection]) {
        idsByCollection[entry.collection] = [];
      }

      idsByCollection[entry.collection].push(entry.id);
    });

  return { idsByCollection };
}

function buildRemoteCandidates(remoteBaseUrl) {
  const normalized = normalizeRemoteUrl(remoteBaseUrl);
  const candidates = [normalized];

  if (normalized.endsWith("/api")) {
    candidates.push(normalized.slice(0, -4));
  } else {
    candidates.push(`${normalized}/api`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

function withProbeTimestamp(pathWithQuery) {
  const separator = pathWithQuery.includes("?") ? "&" : "?";
  return `${pathWithQuery}${separator}t=${Date.now()}`;
}

async function resolveRemoteBaseUrl(remoteBaseUrl) {
  const candidates = buildRemoteCandidates(remoteBaseUrl);
  const probePaths = ["/sync/status", "/sync/download?limit=1", "/app/version"];
  let lastError = null;

  for (const candidate of candidates) {
    for (const probePath of probePaths) {
      try {
        await fetchJsonWithTimeout(
          `${candidate}${withProbeTimestamp(probePath)}`,
          { method: "GET" },
          5000
        );

        return {
          reachable: true,
          baseUrl: candidate,
          probePath,
          candidates,
        };
      } catch (error) {
        lastError = error;
      }
    }
  }

  return {
    reachable: false,
    baseUrl: candidates[0] || null,
    probePath: null,
    candidates,
    error: lastError ? lastError.message : "Remote probe failed",
  };
}

async function isLocalDataEffectivelyEmpty() {
  const keyCollections = ["students", "teachers", "schools", "questions", "quizzes"];

  for (const collectionName of keyCollections) {
    const model = SYNC_MODELS[collectionName];
    if (!model) {
      continue;
    }

    const count = await model.countDocuments({}).setOptions({ includeDeleted: true });
    if (count > 0) {
      return false;
    }
  }

  return true;
}

async function bootstrapFromAtlas({ sourceUri, sourceDbName, collections }) {
  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });

  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);
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

    const applyResult = await applyUploadedChanges(payload, {
      collections,
      markSynced: true,
    });

    return {
      sourceDbName,
      sourceCounts,
      summary: applyResult.summary,
      appliedAny: (applyResult.summary.inserted || 0) + (applyResult.summary.updated || 0) > 0,
      serverTime: new Date().toISOString(),
    };
  } finally {
    await client.close();
  }
}

function resolveAtlasRecordUpdatedAt(record = {}) {
  const parsedUpdatedAt = parseDate(record.updatedAt);
  if (parsedUpdatedAt) {
    return parsedUpdatedAt;
  }

  const parsedCreatedAt = parseDate(record.createdAt);
  if (parsedCreatedAt) {
    return parsedCreatedAt;
  }

  // ObjectId embeds a creation timestamp; use it as stable fallback for manual Atlas inserts.
  if (record && record._id && typeof record._id.getTimestamp === "function") {
    const idTimestamp = parseDate(record._id.getTimestamp());
    if (idTimestamp) {
      return idTimestamp;
    }
  }

  return new Date();
}

function normalizeAtlasRecord(record = {}) {
  return {
    ...record,
    isDeleted: typeof record.isDeleted === "boolean" ? record.isDeleted : false,
    updatedAt: resolveAtlasRecordUpdatedAt(record),
    synced: true,
  };
}

async function uploadPendingToAtlas({ sourceUri, sourceDbName, collections }) {
  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });
  const summary = { inserted: 0, updated: 0, skipped: 0, failed: 0 };
  const results = [];

  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);

    for (const [logicalCollection, records] of Object.entries(collections || {})) {
      const model = SYNC_MODELS[logicalCollection];
      if (!model || !Array.isArray(records) || records.length === 0) {
        continue;
      }

      const sourceCollection = sourceDb.collection(model.collection.name);

      for (const record of records) {
        const normalized = normalizeAtlasRecord(record);

        try {
          const existing = await sourceCollection.findOne({ _id: normalized._id });
          const incomingUpdatedAt = parseDate(normalized.updatedAt) || new Date(0);
          const existingUpdatedAt = parseDate(existing && existing.updatedAt) || new Date(0);

          if (!existing) {
            await sourceCollection.insertOne(normalized);
            summary.inserted += 1;
            results.push({
              collection: logicalCollection,
              id: String(normalized._id),
              status: "inserted",
              updatedAt: normalized.updatedAt,
            });
            continue;
          }

          if (incomingUpdatedAt.getTime() > existingUpdatedAt.getTime()) {
            await sourceCollection.replaceOne({ _id: normalized._id }, normalized, { upsert: true });
            summary.updated += 1;
            results.push({
              collection: logicalCollection,
              id: String(normalized._id),
              status: "updated",
              updatedAt: normalized.updatedAt,
            });
            continue;
          }

          summary.skipped += 1;
          results.push({
            collection: logicalCollection,
            id: String(normalized._id),
            status: "skipped",
            reason: "cloud-newer-or-equal",
            updatedAt: existingUpdatedAt,
          });
        } catch (error) {
          summary.failed += 1;
          results.push({
            collection: logicalCollection,
            id: record && record._id ? String(record._id) : null,
            status: "failed",
            error: error.message,
          });
        }
      }
    }

    return {
      sourceDbName,
      summary,
      results,
    };
  } finally {
    await client.close();
  }
}

async function downloadAtlasDelta({ sourceUri, sourceDbName, collections, lastSync }) {
  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });
  const parsedLastSync = parseDate(lastSync);
  const query = parsedLastSync
    ? {
        $or: [
          { updatedAt: { $gt: parsedLastSync } },
          { updatedAt: { $exists: false } },
          { updatedAt: null },
        ],
      }
    : {};
  const payload = {};
  let totalRecords = 0;

  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);

    for (const logicalCollection of collections) {
      const model = SYNC_MODELS[logicalCollection];
      if (!model) {
        continue;
      }

      const sourceCollection = sourceDb.collection(model.collection.name);
      const records = await sourceCollection
        .find(query)
        .sort({ updatedAt: 1 })
        .limit(ATLAS_DELTA_LIMIT)
        .toArray();

      const normalizedRecords = [];

      for (const record of records) {
        const normalized = normalizeAtlasRecord(record);
        normalizedRecords.push(normalized);

        // Backfill missing updatedAt in Atlas so incremental pulls remain reliable.
        if (!parseDate(record.updatedAt)) {
          await sourceCollection.updateOne(
            { _id: record._id },
            {
              $set: {
                updatedAt: normalized.updatedAt,
                isDeleted: normalized.isDeleted,
              },
            }
          );
        }
      }

      payload[logicalCollection] = normalizedRecords;
      totalRecords += normalizedRecords.length;
    }

    return {
      sourceDbName,
      collections: payload,
      totalRecords,
      serverTime: new Date().toISOString(),
    };
  } finally {
    await client.close();
  }
}

function shouldRunAutoSync() {
  if (!AUTO_SYNC_ENABLED) {
    return false;
  }

  const nodeRole = String(process.env.SYNC_NODE_ROLE || "local").toLowerCase();
  return nodeRole === "local";
}

async function runAutoSyncCycle(options = {}) {
  if (cycleInProgress) {
    return {
      ok: false,
      skipped: true,
      reason: "in-progress",
      state: getAutoSyncState(),
    };
  }

  if (!shouldRunAutoSync()) {
    return {
      ok: false,
      skipped: true,
      reason: "auto-sync-disabled-or-not-local-node",
      state: getAutoSyncState(),
    };
  }

  const originalRemoteUrl = normalizeRemoteUrl(options.remoteUrl || process.env.SYNC_REMOTE_URL);
  const ignoreLoopbackRemote = shouldIgnoreLoopbackRemote(originalRemoteUrl);
  const configuredRemoteUrl = ignoreLoopbackRemote ? "" : originalRemoteUrl;
  const sourceUri = String(process.env.MONGO_URI || "").trim();
  const sourceDbName = String(process.env.SYNC_SOURCE_DB_NAME || "test").trim();

  cycleInProgress = true;
  updateState({
    status: "running",
    lastRunAt: new Date().toISOString(),
    lastError: null,
  });

  const selectedCollections = resolveCollections(options.collections);

  const cycleSummary = {
    trigger: options.trigger || "manual",
    mode: "none",
    remoteBaseUrl: configuredRemoteUrl || null,
    sourceDbName: sourceUri ? sourceDbName : null,
    remote: {
      configured: Boolean(originalRemoteUrl),
      available: false,
      reason: configuredRemoteUrl
        ? null
        : ignoreLoopbackRemote
        ? "remote-url-points-to-local-node"
        : "remote-url-not-configured",
      probePath: null,
      candidatesTried: [],
    },
    push: { attempted: false, pendingRecords: 0, uploadedRecords: 0 },
    pull: { attempted: false, downloadedRecords: 0, appliedInserted: 0, appliedUpdated: 0 },
    media: {
      attempted: false,
      scannedRecords: 0,
      updatedRecords: 0,
      foundUrls: 0,
      downloadedFiles: 0,
      failedUrls: 0,
    },
    authPasswords: {
      attempted: false,
      repaired: 0,
      scannedRemote: 0,
      failed: 0,
      skipped: false,
      reason: null,
    },
    bootstrap: null,
  };

  try {
    const runMediaSync = async () => {
      cycleSummary.media.attempted = true;
      try {
        const mediaSummary = await syncCloudMediaToLocal({
          collections: selectedCollections,
        });
        cycleSummary.media = {
          attempted: true,
          ...mediaSummary,
        };

        if ((mediaSummary.downloadedFiles || 0) > 0 || (mediaSummary.updatedRecords || 0) > 0) {
          console.log(
            `📥 Media sync: downloaded=${mediaSummary.downloadedFiles || 0}, updatedRecords=${mediaSummary.updatedRecords || 0}, failedUrls=${mediaSummary.failedUrls || 0}`
          );
        }
      } catch (mediaError) {
        cycleSummary.media = {
          ...cycleSummary.media,
          attempted: true,
          error: mediaError.message,
        };
      }
    };

    const runAuthPasswordRepair = async ({ force = false } = {}) => {
      const shouldAttempt =
        force ||
        Boolean(cycleSummary.pull.downloadedRecords > 0) ||
        Boolean(cycleSummary.bootstrap && !cycleSummary.bootstrap.error);

      if (!shouldAttempt) {
        cycleSummary.authPasswords = {
          ...cycleSummary.authPasswords,
          attempted: false,
          skipped: true,
          reason: "no-fresh-pull-data",
        };
        return;
      }

      cycleSummary.authPasswords.attempted = true;
      try {
        const repairSummary = await repairAllLocalAuthPasswordsFromAtlas();
        cycleSummary.authPasswords = {
          ...cycleSummary.authPasswords,
          ...repairSummary,
        };

        if ((repairSummary.repaired || 0) > 0) {
          console.log(`🔐 Auth hash repair: repaired=${repairSummary.repaired}`);
        }
      } catch (repairError) {
        cycleSummary.authPasswords = {
          ...cycleSummary.authPasswords,
          attempted: true,
          error: repairError.message,
        };
      }
    };

    let activeRemoteUrl = configuredRemoteUrl;
    if (configuredRemoteUrl) {
      const remoteProbe = await resolveRemoteBaseUrl(configuredRemoteUrl);
      cycleSummary.remote.available = remoteProbe.reachable;
      cycleSummary.remote.reason = remoteProbe.reachable ? null : remoteProbe.error || "remote-unreachable";
      cycleSummary.remote.probePath = remoteProbe.probePath;
      cycleSummary.remote.candidatesTried = remoteProbe.candidates || [];

      if (remoteProbe.reachable && remoteProbe.baseUrl) {
        activeRemoteUrl = remoteProbe.baseUrl;
        cycleSummary.remoteBaseUrl = remoteProbe.baseUrl;
      }
    }

    const remoteAvailable = Boolean(cycleSummary.remote.available && activeRemoteUrl);
    const atlasAvailable = Boolean(sourceUri);

    if (remoteAvailable) {
      cycleSummary.mode = "remote-api";
    } else if (atlasAvailable) {
      cycleSummary.mode = "atlas-direct";
    }

    const localEmpty = await isLocalDataEffectivelyEmpty();
    if (localEmpty || options.forceBootstrap) {
      if (remoteAvailable) {
        try {
          const fullDownload = await fetchJsonWithTimeout(
            `${activeRemoteUrl}/sync/download`,
            { method: "GET" }
          );

          if (fullDownload && hasAnyRecords(fullDownload.collections)) {
            const applied = await applyUploadedChanges(
              { collections: fullDownload.collections },
              { collections: selectedCollections, markSynced: true }
            );

            cycleSummary.bootstrap = {
              type: "remote-download",
              summary: applied.summary,
            };

            if (fullDownload.serverTime) {
              updateState({ lastSync: fullDownload.serverTime });
            }
          }
        } catch (bootstrapError) {
          cycleSummary.bootstrap = {
            type: "remote-download",
            error: bootstrapError.message,
          };
        }
      }

      // Fallback bootstrap directly from Atlas if remote sync API has no dataset
      // or if remote sync URL is not reachable/configured.
      if ((!cycleSummary.bootstrap || cycleSummary.bootstrap.error) && atlasAvailable) {
        try {
          const atlasBootstrap = await bootstrapFromAtlas({
            sourceUri,
            sourceDbName,
            collections: selectedCollections,
          });

          cycleSummary.bootstrap = {
            type: "atlas",
            ...atlasBootstrap,
          };

          if (atlasBootstrap.serverTime) {
            // Seed lastSync to avoid immediate full-dataset pull after successful bootstrap.
            updateState({ lastSync: atlasBootstrap.serverTime });
          }
        } catch (atlasError) {
          cycleSummary.bootstrap = {
            type: "atlas",
            error: atlasError.message,
          };
        }
      }
    }

    if (remoteAvailable) {
      // Local -> cloud (upload pending unsynced records)
      cycleSummary.push.attempted = true;
      const pending = await fetchPendingChanges({ collections: selectedCollections });
      cycleSummary.push.pendingRecords = pending.totalRecords || 0;

      if (pending.totalRecords > 0 && hasAnyRecords(pending.collections)) {
        const remoteUpload = await fetchJsonWithTimeout(`${activeRemoteUrl}/sync/upload`, {
          method: "POST",
          body: JSON.stringify({ collections: pending.collections }),
        });

        const uploadResults = Array.isArray(remoteUpload.results) ? remoteUpload.results : [];
        cycleSummary.push.uploadedRecords = uploadResults.filter((entry) => entry.status !== "failed").length;

        const markSyncedPayload = buildMarkSyncedPayload(uploadResults);
        if (hasAnyRecords(markSyncedPayload.idsByCollection)) {
          await markRecordsSynced(markSyncedPayload);
        }
      }

      // Cloud -> local (download incremental updates)
      cycleSummary.pull.attempted = true;
      const lastSync = runtimeState.lastSync || null;
      const query = toQueryString({ lastSync });
      const deltaUrl = `${activeRemoteUrl}/sync/download${query ? `?${query}` : ""}`;

      const remoteDelta = await fetchJsonWithTimeout(deltaUrl, { method: "GET" });
      cycleSummary.pull.downloadedRecords = remoteDelta.totalRecords || 0;

      if (remoteDelta.totalRecords > 0 && hasAnyRecords(remoteDelta.collections)) {
        const appliedDelta = await applyUploadedChanges(
          { collections: remoteDelta.collections },
          { collections: selectedCollections, markSynced: true }
        );

        cycleSummary.pull.appliedInserted = appliedDelta.summary.inserted || 0;
        cycleSummary.pull.appliedUpdated = appliedDelta.summary.updated || 0;
      }

      const nextLastSync = remoteDelta.serverTime || new Date().toISOString();
      await runMediaSync();
      await runAuthPasswordRepair({ force: localEmpty || Boolean(options.forceBootstrap) });
      updateState({
        status: "success",
        lastSuccessAt: new Date().toISOString(),
        lastSync: nextLastSync,
        lastError: null,
      });

      return {
        ok: true,
        summary: cycleSummary,
        state: getAutoSyncState(),
      };
    }

    if (atlasAvailable) {
      // Local -> Atlas direct (no remote API needed).
      cycleSummary.push.attempted = true;
      const pending = await fetchPendingChanges({ collections: selectedCollections });
      cycleSummary.push.pendingRecords = pending.totalRecords || 0;

      if (pending.totalRecords > 0 && hasAnyRecords(pending.collections)) {
        const atlasUpload = await uploadPendingToAtlas({
          sourceUri,
          sourceDbName,
          collections: pending.collections,
        });

        cycleSummary.push.uploadedRecords = (atlasUpload.results || []).filter(
          (entry) => entry.status !== "failed"
        ).length;

        const markSyncedPayload = buildMarkSyncedPayload(atlasUpload.results || []);
        if (hasAnyRecords(markSyncedPayload.idsByCollection)) {
          await markRecordsSynced(markSyncedPayload);
        }
      }

      // Atlas -> local (incremental delta by updatedAt).
      cycleSummary.pull.attempted = true;
      const atlasDelta = await downloadAtlasDelta({
        sourceUri,
        sourceDbName,
        collections: selectedCollections,
        lastSync: runtimeState.lastSync || null,
      });

      cycleSummary.pull.downloadedRecords = atlasDelta.totalRecords || 0;

      if (atlasDelta.totalRecords > 0 && hasAnyRecords(atlasDelta.collections)) {
        const appliedDelta = await applyUploadedChanges(
          { collections: atlasDelta.collections },
          { collections: selectedCollections, markSynced: true }
        );

        cycleSummary.pull.appliedInserted = appliedDelta.summary.inserted || 0;
        cycleSummary.pull.appliedUpdated = appliedDelta.summary.updated || 0;
      }

      const nextLastSync = atlasDelta.serverTime || new Date().toISOString();
      await runMediaSync();
      await runAuthPasswordRepair({ force: localEmpty || Boolean(options.forceBootstrap) });
      updateState({
        status: "success",
        lastSuccessAt: new Date().toISOString(),
        lastSync: nextLastSync,
        lastError: null,
      });

      return {
        ok: true,
        summary: cycleSummary,
        state: getAutoSyncState(),
      };
    }

    const remoteReason = cycleSummary.remote.reason || "remote-unreachable";
    updateState({
      status: "offline",
      lastError: remoteReason,
    });

    if (!localEmpty) {
      await runMediaSync();
      return {
        ok: false,
        skipped: true,
        reason: remoteReason,
        summary: cycleSummary,
        state: getAutoSyncState(),
      };
    }

    return {
      ok: false,
      error: `Local DB empty and sync source unavailable (${remoteReason})`,
      summary: cycleSummary,
      state: getAutoSyncState(),
    };
  } catch (error) {
    updateState({
      status: "error",
      lastError: error.message,
    });

    return {
      ok: false,
      error: error.message,
      summary: cycleSummary,
      state: getAutoSyncState(),
    };
  } finally {
    cycleInProgress = false;
  }
}

function startAutoSync() {
  if (!shouldRunAutoSync()) {
    console.log("⏭️ Auto sync disabled or node is not local.");
    return;
  }

  if (autoSyncInterval) {
    return;
  }

  runAutoSyncCycle({ trigger: "startup-immediate", forceBootstrap: true }).catch((error) => {
    console.error("Immediate startup sync failed:", error);
  });

  setTimeout(() => {
    runAutoSyncCycle({ trigger: "startup-delayed" }).catch((error) => {
      console.error("Delayed startup sync failed:", error);
    });
  }, AUTO_SYNC_START_DELAY_MS);

  autoSyncInterval = setInterval(() => {
    runAutoSyncCycle({ trigger: "interval" }).catch((error) => {
      console.error("Interval auto sync failed:", error);
    });
  }, AUTO_SYNC_INTERVAL_MS);

  console.log(`🔄 Auto sync started (every ${AUTO_SYNC_INTERVAL_MS}ms)`);
}

function stopAutoSync() {
  if (!autoSyncInterval) {
    return;
  }

  clearInterval(autoSyncInterval);
  autoSyncInterval = null;
}

module.exports = {
  startAutoSync,
  stopAutoSync,
  runAutoSyncCycle,
  getAutoSyncState,
};
