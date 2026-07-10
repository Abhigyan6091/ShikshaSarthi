const { dynamo, PutCommand } = require("../lib/aws");
const {
  DEFAULT_COLLECTIONS,
  deltaTimestamp,
  filterDelta,
  readCollectionState,
  sanitizeScope,
} = require("../lib/cloudSyncStore");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

function resolveCollections(input) {
  if (Array.isArray(input)) {
    return input.filter((name) => DEFAULT_COLLECTIONS.includes(name));
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((name) => name.trim())
      .filter((name) => DEFAULT_COLLECTIONS.includes(name));
  }

  return DEFAULT_COLLECTIONS;
}

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const query = event.queryStringParameters || {};
  const body = event.body ? readJsonBody(event) : {};
  const schoolId = sanitizeSchoolId(body.schoolId || query.schoolId);
  const nodeId = String(body.nodeId || query.nodeId || `${schoolId}-node`);
  const scope = sanitizeScope(body.scope || query.scope || "global", schoolId);
  const since = body.since || query.since || null;
  const selectedCollections = resolveCollections(body.collections || query.collections);
  const requestedLimit = Number(body.limit || query.limit || 500);
  // Older school servers request every collection in one pull with limit=500.
  // After large question-bank seeds, that response can exceed Lambda/API
  // Gateway payload limits and surfaces to schools only as "Internal Server
  // Error". Keep single-collection pulls fast, but cap all-collection legacy
  // pulls to a response size that the gateway can return reliably.
  const limit = selectedCollections.length > 1
    ? Math.min(requestedLimit || 500, Number(process.env.MULTI_COLLECTION_PULL_LIMIT || 100))
    : (requestedLimit || 500);
  const timestamp = nowIso();

  const collections = {};
  const collectionStats = {};
  let totalRecords = 0;
  let cursorTime = null;

  for (const collectionName of selectedCollections) {
    const current = await readCollectionState({
      bucket: process.env.SCHOOL_DATA_BUCKET,
      scope,
      collectionName,
    });
    const records = filterDelta(current.records, { since, limit });
    for (const record of records) {
      const recordCursor = deltaTimestamp(record);
      if (!cursorTime || recordCursor.getTime() > cursorTime.getTime()) {
        cursorTime = recordCursor;
      }
    }
    collections[collectionName] = records;
    collectionStats[collectionName] = {
      key: current.key,
      totalCloudRecords: current.records.length,
      returnedRecords: records.length,
      updatedAt: current.updatedAt,
    };
    totalRecords += records.length;
  }

  await dynamo.send(new PutCommand({
    TableName: process.env.SYNC_LOGS_TABLE,
    Item: {
      schoolId,
      timestamp,
      type: "cloud-record-pull",
      status: "completed",
      message: `Cloud merge pull scope=${scope}`,
      recordsUploaded: 0,
      recordsDownloaded: totalRecords,
      backupUploaded: false,
      videoUploaded: false,
      appVersion: body.appVersion || query.appVersion || null,
    },
  }));

  return json(200, {
    ok: true,
    scope,
    schoolId,
    nodeId,
    since,
    serverTime: timestamp,
    cursorTime: cursorTime ? cursorTime.toISOString() : timestamp,
    totalRecords,
    collections,
    stats: collectionStats,
  });
};
