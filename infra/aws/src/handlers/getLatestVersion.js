const { createDownloadUrl, latestVersion } = require("../lib/aws");
const { json, nowIso } = require("../lib/response");

exports.handler = async (event) => {
  const channel = event.queryStringParameters?.channel || "stable";
  const includePackageUrl = event.queryStringParameters?.packageUrl === "true";
  const latest = await latestVersion(channel);

  if (!latest) {
    return json(200, {
      ok: true,
      latestVersion: "1.0.0",
      minimumSupportedVersion: "1.0.0",
      releaseDate: nowIso(),
      mandatory: false,
      channel,
      packageUrl: null,
      packageKey: "releases/1.0.0/shiksha-sarthi-1.0.0.zip",
      sha256: "",
      releaseNotes: [],
      timestamp: nowIso(),
    });
  }

  const presign = (key) =>
    includePackageUrl && key
      ? createDownloadUrl({ bucket: process.env.UPDATES_BUCKET, key })
      : Promise.resolve(null);

  const [packageUrl, windowsInstallerUrl, linuxInstallerUrl] = await Promise.all([
    presign(latest.packageKey),
    presign(latest.windowsInstallerKey),
    presign(latest.linuxInstallerKey),
  ]);

  return json(200, {
    ok: true,
    latestVersion: latest.version,
    minimumSupportedVersion: latest.minSupportedVersion || latest.version,
    releaseDate: latest.releaseDate || latest.createdAt,
    mandatory: Boolean(latest.mandatory),
    channel: latest.channel || channel,
    packageUrl,
    packageKey: latest.packageKey || null,
    sha256: latest.packageSha256 || "",
    manifestKey: latest.manifestKey || null,
    windowsInstallerKey: latest.windowsInstallerKey || null,
    linuxInstallerKey: latest.linuxInstallerKey || null,
    windowsInstallerSha256: latest.windowsInstallerSha256 || null,
    linuxInstallerSha256: latest.linuxInstallerSha256 || null,
    windowsInstallerUrl,
    linuxInstallerUrl,
    releaseNotes: Array.isArray(latest.releaseNotes) ? latest.releaseNotes : [],
    timestamp: nowIso(),
  });
};
