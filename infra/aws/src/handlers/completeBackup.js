const { dynamo, PutCommand } = require("../lib/aws");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const item = {
    schoolId: sanitizeSchoolId(body.schoolId),
    timestamp: body.timestamp || nowIso(),
    type: "backup",
    status: "completed",
    message: body.key || body.fileName || "Backup uploaded",
    recordsUploaded: 0,
    recordsDownloaded: 0,
    backupUploaded: true,
    videoUploaded: false,
    appVersion: body.appVersion || null,
    sha256: body.sha256 || null,
    size: Number(body.size || 0),
  };

  await dynamo.send(new PutCommand({ TableName: process.env.SYNC_LOGS_TABLE, Item: item }));
  return json(200, { ok: true, log: item });
};
