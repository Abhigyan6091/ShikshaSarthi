const { dynamo, PutCommand } = require("../lib/aws");
const { json, nowIso, readJsonBody, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const schoolId = sanitizeSchoolId(body.schoolId);
  const item = {
    schoolId,
    schoolName: body.schoolName || schoolId,
    licenseStatus: body.licenseStatus || "active",
    registeredAt: nowIso(),
    lastSeenAt: null,
    currentVersion: body.currentVersion || null,
    targetVersion: body.targetVersion || null,
    syncEnabled: Boolean(body.syncEnabled),
    updateChannel: body.updateChannel || "stable",
    notes: body.notes || "",
  };

  await dynamo.send(new PutCommand({ TableName: process.env.SCHOOLS_TABLE, Item: item }));
  return json(201, { ok: true, school: item });
};
