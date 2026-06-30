const { dynamo, PutCommand } = require("../lib/aws");
const { json, nowIso, readJsonBody, requireApiKey } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  if (!body.version) {
    return json(400, { ok: false, error: "version is required" });
  }

  const item = {
    version: String(body.version),
    releaseDate: body.releaseDate || nowIso(),
    channel: body.channel || "stable",
    mandatory: Boolean(body.mandatory),
    minSupportedVersion: body.minSupportedVersion || body.version,
    packageKey: body.packageKey || null,
    packageSha256: body.packageSha256 || body.sha256 || null,
    manifestKey: body.manifestKey || null,
    windowsInstallerKey: body.windowsInstallerKey || null,
    linuxInstallerKey: body.linuxInstallerKey || null,
    releaseNotes: Array.isArray(body.releaseNotes) ? body.releaseNotes : [],
    createdAt: nowIso(),
  };

  await dynamo.send(new PutCommand({ TableName: process.env.VERSIONS_TABLE, Item: item }));
  return json(201, { ok: true, version: item });
};
