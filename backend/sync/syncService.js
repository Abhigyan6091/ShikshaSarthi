const mongoose = require("mongoose");
const { SYNC_MODELS, SYNC_COLLECTIONS } = require("./modelRegistry");
const { restoreCloudUrlsForUpload, getMediaMapSnapshot } = require("./mediaSyncService");

const DEFAULT_INCREMENTAL_LIMIT = Number(process.env.SYNC_INCREMENTAL_LIMIT || 500);
const DEFAULT_INITIAL_LIMIT = Number(process.env.SYNC_INITIAL_LIMIT || 5000);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalizeLimit(limitInput, fallback) {
  const parsed = Number(limitInput);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function normalizeSyncRecord(record, { markSynced }) {
  const nextRecord = { ...(record || {}) };

  if (!nextRecord._id) {
    nextRecord._id = new mongoose.Types.ObjectId();
  }

  const updatedAt = parseDate(nextRecord.updatedAt) || new Date();
  nextRecord.updatedAt = updatedAt;

  if (typeof nextRecord.isDeleted === "undefined") {
    nextRecord.isDeleted = false;
  }

  if (typeof markSynced === "boolean") {
    nextRecord.synced = markSynced;
  }

  delete nextRecord.__v;

  return nextRecord;
}

function resolveCollections(collectionsInput) {
  if (!collectionsInput) {
    return SYNC_COLLECTIONS;
  }

  if (Array.isArray(collectionsInput)) {
    return collectionsInput.filter((name) => SYNC_MODELS[name]);
  }

  if (typeof collectionsInput === "string") {
    return collectionsInput
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .filter((name) => SYNC_MODELS[name]);
  }

  return SYNC_COLLECTIONS;
}

function mergeCollectionRecords(target, collectionName, records) {
  if (!Array.isArray(records) || !records.length) {
    return;
  }

  if (!target[collectionName]) {
    target[collectionName] = [];
  }

  target[collectionName].push(...records);
}

function normalizeCollectionPayload(rawPayload) {
  const normalized = {};

  if (!isPlainObject(rawPayload)) {
    return normalized;
  }

  if (isPlainObject(rawPayload.collections)) {
    Object.entries(rawPayload.collections).forEach(([collectionName, records]) => {
      if (SYNC_MODELS[collectionName] && Array.isArray(records)) {
        mergeCollectionRecords(normalized, collectionName, records);
      }
    });
  }

  if (Array.isArray(rawPayload.records)) {
    rawPayload.records.forEach((entry) => {
      if (!isPlainObject(entry)) {
        return;
      }

      const collectionName = entry.collection;
      const record = entry.record || entry.data;
      if (!SYNC_MODELS[collectionName] || !record) {
        return;
      }

      mergeCollectionRecords(normalized, collectionName, [record]);
    });
  }

  SYNC_COLLECTIONS.forEach((collectionName) => {
    if (Array.isArray(rawPayload[collectionName])) {
      mergeCollectionRecords(normalized, collectionName, rawPayload[collectionName]);
    }
  });

  return normalized;
}

async function applySingleRecord(model, collectionName, record, { markSynced }) {
  const normalizedRecord = normalizeSyncRecord(record, { markSynced });
  const incomingUpdatedAt = parseDate(normalizedRecord.updatedAt) || new Date(0);

  const existingRecord = await model
    .findById(normalizedRecord._id)
    .setOptions({ includeDeleted: true })
    .lean();

  if (!existingRecord) {
    // Use replaceOne upsert to bypass model save hooks (e.g. password re-hash hooks)
    // when applying synced records from another node.
    await model.replaceOne(
      { _id: normalizedRecord._id },
      normalizedRecord,
      { upsert: true, runValidators: false, skipSyncMetadata: true, timestamps: false }
    );

    return {
      collection: collectionName,
      id: String(normalizedRecord._id),
      status: "inserted",
      updatedAt: normalizedRecord.updatedAt,
    };
  }

  const existingUpdatedAt = parseDate(existingRecord.updatedAt) || new Date(0);
  if (incomingUpdatedAt.getTime() <= existingUpdatedAt.getTime()) {
    return {
      collection: collectionName,
      id: String(normalizedRecord._id),
      status: "skipped",
      reason: "local-newer-or-equal",
      updatedAt: existingUpdatedAt,
    };
  }

  await model.replaceOne(
    { _id: normalizedRecord._id },
    normalizedRecord,
    { upsert: true, runValidators: false, skipSyncMetadata: true, timestamps: false }
  );

  return {
    collection: collectionName,
    id: String(normalizedRecord._id),
    status: "updated",
    updatedAt: normalizedRecord.updatedAt,
  };
}

async function applyUploadedChanges(rawPayload, options = {}) {
  const markSynced = options.markSynced !== false;
  const collections = normalizeCollectionPayload(rawPayload);
  const allowedCollections = resolveCollections(options.collections || Object.keys(collections));

  const summary = {
    received: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  const results = [];

  for (const collectionName of allowedCollections) {
    const model = SYNC_MODELS[collectionName];
    const records = collections[collectionName] || [];

    for (const record of records) {
      summary.received += 1;

      try {
        const result = await applySingleRecord(model, collectionName, record, { markSynced });
        summary[result.status] += 1;
        results.push(result);
      } catch (error) {
        summary.failed += 1;
        results.push({
          collection: collectionName,
          id: record && record._id ? String(record._id) : null,
          status: "failed",
          error: error.message,
        });
      }
    }
  }

  return {
    collections,
    summary,
    results,
  };
}

async function fetchDeltaChanges({ lastSync, collections, limit }) {
  const selectedCollections = resolveCollections(collections);
  const parsedLastSync = parseDate(lastSync);
  const effectiveLimit = normalizeLimit(
    limit,
    parsedLastSync ? DEFAULT_INCREMENTAL_LIMIT : DEFAULT_INITIAL_LIMIT
  );

  const collectionPayload = {};
  let totalRecords = 0;

  for (const collectionName of selectedCollections) {
    const model = SYNC_MODELS[collectionName];
    const query = parsedLastSync ? { updatedAt: { $gt: parsedLastSync } } : {};

    const records = await model
      .find(query)
      .setOptions({ includeDeleted: true })
      .sort({ updatedAt: 1 })
      .limit(effectiveLimit)
      .lean();

    collectionPayload[collectionName] = records;
    totalRecords += records.length;
  }

  return {
    collections: collectionPayload,
    totalRecords,
    lastSync: parsedLastSync,
    limit: effectiveLimit,
  };
}

async function fetchPendingChanges({ collections, limit }) {
  const selectedCollections = resolveCollections(collections);
  const effectiveLimit = normalizeLimit(limit, DEFAULT_INCREMENTAL_LIMIT);
  const mediaMap = getMediaMapSnapshot();

  const collectionPayload = {};
  let totalRecords = 0;

  for (const collectionName of selectedCollections) {
    const model = SYNC_MODELS[collectionName];
    const records = await model
      .find({ synced: false })
      .setOptions({ includeDeleted: true })
      .sort({ updatedAt: 1 })
      .limit(effectiveLimit)
      .lean();

    // Before pushing local pending docs to cloud, restore local media URLs back to
    // original cloud URLs using media map so cloud data is not polluted with /uploads paths.
    collectionPayload[collectionName] = records.map((record) => restoreCloudUrlsForUpload(record, mediaMap));
    totalRecords += records.length;
  }

  return {
    collections: collectionPayload,
    totalRecords,
    limit: effectiveLimit,
  };
}

function normalizeMarkSyncedPayload(rawPayload) {
  const idsByCollection = {};

  if (!isPlainObject(rawPayload)) {
    return idsByCollection;
  }

  if (Array.isArray(rawPayload.items)) {
    rawPayload.items.forEach((item) => {
      if (!isPlainObject(item) || !item.collection || !item.id) {
        return;
      }

      if (!SYNC_MODELS[item.collection]) {
        return;
      }

      if (!idsByCollection[item.collection]) {
        idsByCollection[item.collection] = [];
      }

      idsByCollection[item.collection].push(item.id);
    });
  }

  if (isPlainObject(rawPayload.idsByCollection)) {
    Object.entries(rawPayload.idsByCollection).forEach(([collectionName, ids]) => {
      if (!SYNC_MODELS[collectionName] || !Array.isArray(ids)) {
        return;
      }

      if (!idsByCollection[collectionName]) {
        idsByCollection[collectionName] = [];
      }

      idsByCollection[collectionName].push(...ids);
    });
  }

  Object.entries(rawPayload).forEach(([collectionName, ids]) => {
    if (!SYNC_MODELS[collectionName] || !Array.isArray(ids)) {
      return;
    }

    if (!idsByCollection[collectionName]) {
      idsByCollection[collectionName] = [];
    }

    idsByCollection[collectionName].push(...ids);
  });

  return idsByCollection;
}

async function markRecordsSynced(rawPayload) {
  const idsByCollection = normalizeMarkSyncedPayload(rawPayload);
  const result = {};

  for (const [collectionName, ids] of Object.entries(idsByCollection)) {
    const model = SYNC_MODELS[collectionName];
    if (!model) {
      continue;
    }

    const uniqueIds = [...new Set(ids.map((id) => String(id)).filter(Boolean))];
    if (!uniqueIds.length) {
      result[collectionName] = { matchedCount: 0, modifiedCount: 0 };
      continue;
    }

    const writeResult = await model.updateMany(
      { _id: { $in: uniqueIds } },
      { $set: { synced: true } },
      {
        includeDeleted: true,
        skipSyncMetadata: true,
      }
    );

    result[collectionName] = {
      matchedCount: writeResult.matchedCount || 0,
      modifiedCount: writeResult.modifiedCount || 0,
    };
  }

  return result;
}

module.exports = {
  SYNC_COLLECTIONS,
  resolveCollections,
  parseDate,
  normalizeCollectionPayload,
  applyUploadedChanges,
  fetchDeltaChanges,
  fetchPendingChanges,
  markRecordsSynced,
};
