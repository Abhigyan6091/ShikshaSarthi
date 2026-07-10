// NB: the AWS SDK is lazy-required inside read/writeCollectionState only, so the
// pure merge helpers (mergeRecords, filterDelta, deltaTimestamp) can be imported
// and unit-verified without the SDK or a live S3 (see scripts/verifyCloudSync.js).
const { sanitizeSchoolId } = require("./response");

const DEFAULT_COLLECTIONS = [
  "questions",
  "quizzes",
  "students",
  "teachers",
  "schools",
  "schoolAdmins",
  "superAdmins",
  "classes",
  "videoQuestions",
  "audioQuestions",
  "audioQuizAttempts",
  "puzzleResults",
  "matQuestions",
  "matTests",
  "matProgress",
  "experimentQuestions",
  "experimentAttempts",
  "feedbackForms",
  "feedbackResponses",
  "studentReports",
  "quizReports",
  "vocabularyChapters",
];

function sanitizeScope(scope, schoolId) {
  const raw = String(scope || "global").trim();
  if (raw === "school") return `school-${sanitizeSchoolId(schoolId)}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, "") || "global";
}

function collectionKey(scope, collectionName) {
  const safeCollection = String(collectionName || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeCollection) throw new Error("collection name is required");
  return `cloud-sync/${scope}/collections/${safeCollection}.json`;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readCollectionState({ bucket, scope, collectionName }) {
  const { GetObjectCommand, s3 } = require("./aws");
  const key = collectionKey(scope, collectionName);

  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const raw = await streamToString(response.Body);
    const parsed = JSON.parse(raw);

    return {
      key,
      collectionName,
      records: Array.isArray(parsed.records) ? parsed.records : [],
      updatedAt: parsed.updatedAt || null,
    };
  } catch (error) {
    const name = error.name || error.Code || error.code;
    if (name === "NoSuchKey" || name === "NotFound") {
      return { key, collectionName, records: [], updatedAt: null };
    }
    throw error;
  }
}

async function writeCollectionState({ bucket, scope, collectionName, records }) {
  const { PutObjectCommand, s3 } = require("./aws");
  const key = collectionKey(scope, collectionName);
  const now = new Date().toISOString();
  const body = JSON.stringify({
    type: "shiksha-sarthi-cloud-sync-collection",
    scope,
    collectionName,
    updatedAt: now,
    totalRecords: records.length,
    records,
  });

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: "application/json",
    Body: body,
  }));

  return { key, updatedAt: now, totalRecords: records.length };
}

function normalizeId(id) {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (id.$oid) return String(id.$oid);
  if (typeof id.toHexString === "function") return id.toHexString();
  if (id.id && id.id !== id) return normalizeId(id.id);
  if (id._id && id._id !== id) return normalizeId(id._id);
  const value = String(id);
  return value === "[object Object]" ? null : value;
}

function parseTimestamp(value) {
  if (!value) return new Date(0);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function cloudTimestamp(record) {
  return parseTimestamp(record && record._sync && record._sync.cloudUpdatedAt);
}

function deltaTimestamp(record) {
  const cloudDate = cloudTimestamp(record);
  if (cloudDate.getTime() > 0) return cloudDate;
  return parseTimestamp(record && (record.updatedAt || record.createdAt));
}

function normalizeRecord(record, {
  schoolId,
  nodeId,
  now = new Date().toISOString(),
  preserveCloudUpdatedAt = false,
} = {}) {
  const normalized = { ...(record || {}) };
  const id = normalizeId(normalized._id);
  if (!id) return null;
  const existingCloudUpdatedAt = normalized._sync && normalized._sync.cloudUpdatedAt;

  normalized._id = id;
  normalized.updatedAt = parseTimestamp(normalized.updatedAt || normalized.createdAt || now).toISOString();
  normalized.isDeleted = Boolean(normalized.isDeleted);
  normalized.synced = true;
  normalized._sync = {
    ...(normalized._sync || {}),
    schoolId,
    nodeId,
    cloudUpdatedAt: preserveCloudUpdatedAt
      ? parseTimestamp(existingCloudUpdatedAt || normalized.updatedAt || now).toISOString()
      : now,
  };
  delete normalized.__v;

  return normalized;
}

function mergeRecords(existingRecords, incomingRecords, context) {
  const byId = new Map();

  for (const record of existingRecords || []) {
    const normalized = normalizeRecord(record, { ...context, preserveCloudUpdatedAt: true });
    if (normalized) byId.set(normalized._id, normalized);
  }

  const results = [];
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const rawRecord of incomingRecords || []) {
    const incoming = normalizeRecord(rawRecord, context);
    if (!incoming) continue;

    const existing = byId.get(incoming._id);
    if (!existing) {
      byId.set(incoming._id, incoming);
      inserted += 1;
      results.push({ id: incoming._id, status: "inserted", updatedAt: incoming.updatedAt });
      continue;
    }

    const incomingTime = parseTimestamp(incoming.updatedAt).getTime();
    const existingTime = parseTimestamp(existing.updatedAt).getTime();
    // Tombstones win a timestamp tie so a delete is never dropped in favour of a
    // still-active copy (mirrors applySingleRecord on the school server).
    const tombstoneWinsTie = incoming.isDeleted && !existing.isDeleted && incomingTime === existingTime;
    if (incomingTime > existingTime || tombstoneWinsTie) {
      byId.set(incoming._id, incoming);
      updated += 1;
      results.push({ id: incoming._id, status: "updated", updatedAt: incoming.updatedAt });
      continue;
    }

    skipped += 1;
    results.push({ id: incoming._id, status: "skipped", updatedAt: existing.updatedAt });
  }

  const records = [...byId.values()].sort((left, right) =>
    String(left.updatedAt || "").localeCompare(String(right.updatedAt || ""))
  );

  return { records, inserted, updated, skipped, results };
}

function filterDelta(records, { since, limit }) {
  const sinceDate = since ? parseTimestamp(since) : null;
  const maxRecords = Math.max(1, Math.min(Number(limit || 500), 5000));

  return (records || [])
    .filter((record) => !sinceDate || deltaTimestamp(record).getTime() > sinceDate.getTime())
    .sort((left, right) => deltaTimestamp(left).getTime() - deltaTimestamp(right).getTime())
    .slice(0, maxRecords);
}

module.exports = {
  DEFAULT_COLLECTIONS,
  filterDelta,
  deltaTimestamp,
  mergeRecords,
  readCollectionState,
  sanitizeScope,
  writeCollectionState,
};
