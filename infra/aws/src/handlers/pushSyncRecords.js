const { dynamo, PutCommand } = require("../lib/aws");
const {
  DEFAULT_COLLECTIONS,
  mergeRecords,
  readCollectionState,
  sanitizeScope,
  writeCollectionState,
} = require("../lib/cloudSyncStore");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const schoolId = sanitizeSchoolId(body.schoolId);
  const nodeId = String(body.nodeId || `${schoolId}-node`);
  const scope = sanitizeScope(body.scope || "global", schoolId);
  const incomingCollections = body.collections && typeof body.collections === "object" ? body.collections : {};
  const selectedCollections = Object.keys(incomingCollections).filter((name) => DEFAULT_COLLECTIONS.includes(name));
  const timestamp = nowIso();

  const summary = {
    received: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };
  const idsByCollection = {};
  const collectionResults = {};

  for (const collectionName of selectedCollections) {
    const incomingRecords = Array.isArray(incomingCollections[collectionName])
      ? incomingCollections[collectionName]
      : [];

    if (!incomingRecords.length) {
      continue;
    }

    summary.received += incomingRecords.length;

    try {
      const current = await readCollectionState({
        bucket: process.env.SCHOOL_DATA_BUCKET,
        scope,
        collectionName,
      });
      const merged = mergeRecords(current.records, incomingRecords, { schoolId, nodeId, now: timestamp });
      const write = await writeCollectionState({
        bucket: process.env.SCHOOL_DATA_BUCKET,
        scope,
        collectionName,
        records: merged.records,
      });

      summary.inserted += merged.inserted;
      summary.updated += merged.updated;
      summary.skipped += merged.skipped;
      idsByCollection[collectionName] = merged.results
        .filter((result) => result.status !== "failed")
        .map((result) => result.id);
      collectionResults[collectionName] = {
        ...write,
        inserted: merged.inserted,
        updated: merged.updated,
        skipped: merged.skipped,
        accepted: idsByCollection[collectionName].length,
      };
    } catch (error) {
      summary.failed += incomingRecords.length;
      collectionResults[collectionName] = {
        error: error.message,
        accepted: 0,
      };
    }
  }

  await dynamo.send(new PutCommand({
    TableName: process.env.SYNC_LOGS_TABLE,
    Item: {
      schoolId,
      timestamp,
      type: "cloud-record-push",
      status: summary.failed ? "partial" : "completed",
      message: `Cloud merge push scope=${scope}`,
      recordsUploaded: summary.received,
      recordsDownloaded: 0,
      backupUploaded: false,
      videoUploaded: false,
      appVersion: body.appVersion || null,
    },
  }));

  return json(summary.failed ? 207 : 200, {
    ok: summary.failed === 0,
    scope,
    schoolId,
    nodeId,
    timestamp,
    summary,
    idsByCollection,
    collections: collectionResults,
  });
};
