const { dynamo, PutCommand } = require("../lib/aws");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const item = {
    schoolId: sanitizeSchoolId(body.schoolId),
    timestamp: body.timestamp || nowIso(),
    type: body.type || "sync",
    status: body.status || "completed",
    message: body.message || "",
    recordsUploaded: Number(body.recordsUploaded || 0),
    recordsDownloaded: Number(body.recordsDownloaded || 0),
    backupUploaded: Boolean(body.backupUploaded),
    videoUploaded: Boolean(body.videoUploaded),
    appVersion: body.appVersion || null,
  };

  await dynamo.send(new PutCommand({ TableName: process.env.SYNC_LOGS_TABLE, Item: item }));
  return json(200, { ok: true, log: item });
};
