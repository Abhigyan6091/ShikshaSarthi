const { dynamo, UpdateCommand } = require("../lib/aws");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const schoolId = sanitizeSchoolId(body.schoolId);
  const lastSeenAt = nowIso();

  await dynamo.send(new UpdateCommand({
    TableName: process.env.SCHOOLS_TABLE,
    Key: { schoolId },
    UpdateExpression: "SET lastSeenAt = :lastSeenAt, currentVersion = :version, syncEnabled = :syncEnabled, updateChannel = :channel",
    ExpressionAttributeValues: {
      ":lastSeenAt": lastSeenAt,
      ":version": body.currentVersion || null,
      ":syncEnabled": Boolean(body.syncEnabled),
      ":channel": body.updateChannel || "stable",
    },
  }));

  return json(200, { ok: true, schoolId, lastSeenAt });
};
