const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { appConfig, request } = require("./awsControlClient");
const { calculateSha256 } = require("../utils/backupService");

function compareSemver(a, b) {
  const pa = String(a || "0.0.0").split(".").map((part) => parseInt(part, 10) || 0);
  const pb = String(b || "0.0.0").split(".").map((part) => parseInt(part, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

async function getLatestVersion({ withUrl = false } = {}) {
  if (!appConfig.aws.updateCheckEnabled) {
    return { ok: false, message: "AWS update checks are disabled" };
  }

  return request("/version/latest", {
    protected: false,
    query: {
      channel: appConfig.aws.updateChannel,
      packageUrl: withUrl ? "true" : undefined,
    },
  });
}

async function checkForUpdate() {
  const latest = await getLatestVersion();
  const info = latest.data || {};
  const latestVersion = info.latestVersion || info.version || appConfig.version;

  return {
    currentVersion: appConfig.version,
    latestVersion,
    updateAvailable: latest.ok && compareSemver(latestVersion, appConfig.version) > 0,
    mandatory: Boolean(info.mandatory),
    releaseNotes: info.releaseNotes || [],
    downloadReady: false,
    reachable: latest.reachable,
    lastError: latest.lastError,
  };
}

async function downloadUpdatePackage() {
  const latest = await getLatestVersion({ withUrl: true });
  if (!latest.ok) {
    return { downloaded: false, verified: false, error: latest.lastError || "Could not fetch latest version" };
  }

  const info = latest.data;
  const packageUrl = info.packageUrl;
  const expectedSha256 = info.sha256 || info.packageSha256;
  const version = info.latestVersion || info.version;

  if (!packageUrl) {
    return { downloaded: false, verified: false, error: "Latest version does not include a package URL" };
  }
  if (!expectedSha256) {
    return { downloaded: false, verified: false, error: "Latest version does not include a checksum" };
  }

  fs.mkdirSync(appConfig.updatesDir, { recursive: true });
  const fileName = path.basename(info.packageKey || `shiksha-sarthi-${version}.zip`).replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(appConfig.updatesDir, fileName);
  const response = await fetch(packageUrl);

  if (!response.ok) {
    return { downloaded: false, verified: false, error: `Download failed with HTTP ${response.status}` };
  }

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    response.body.pipe(output);
    response.body.on("error", reject);
    output.on("finish", resolve);
  });

  const actualSha256 = calculateSha256(filePath);
  const verified = actualSha256.toLowerCase() === String(expectedSha256).toLowerCase();
  const state = {
    downloaded: true,
    verified,
    filePath,
    version,
    expectedSha256,
    actualSha256,
    checkedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(path.dirname(appConfig.updatesDir), "update-state.json"), JSON.stringify(state, null, 2));
  return state;
}

const installerStatePath = path.join(path.dirname(appConfig.updatesDir), "installer-state.json");

async function downloadInstaller() {
  const latest = await getLatestVersion({ withUrl: true });
  if (!latest.ok) {
    return { ok: false, downloaded: false, error: latest.lastError || "Could not fetch latest version" };
  }

  const info = latest.data;
  const version = info.latestVersion || info.version;
  const isWindows = process.platform === "win32";
  const installerUrl = isWindows ? info.windowsInstallerUrl : info.linuxInstallerUrl;
  const installerKey = isWindows ? info.windowsInstallerKey : info.linuxInstallerKey;
  const expectedSha256 = isWindows ? info.windowsInstallerSha256 : info.linuxInstallerSha256;

  if (!installerUrl) {
    return {
      ok: false,
      downloaded: false,
      error: `Latest version does not include a ${isWindows ? "Windows" : "Linux"} installer URL`,
    };
  }

  if (!expectedSha256) {
    return {
      ok: false,
      downloaded: false,
      error: `Latest version does not include a checksum for the ${isWindows ? "Windows" : "Linux"} installer. Refusing to download an unverifiable installer.`,
    };
  }

  fs.mkdirSync(appConfig.updatesDir, { recursive: true });
  const extension = isWindows ? "exe" : "deb";
  const fileName = path
    .basename(installerKey || `ShikshaSarthi-${version}.${extension}`)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(appConfig.updatesDir, fileName);

  const response = await fetch(installerUrl);
  if (!response.ok) {
    return { ok: false, downloaded: false, error: `Download failed with HTTP ${response.status}` };
  }

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    response.body.pipe(output);
    response.body.on("error", reject);
    output.on("finish", resolve);
  });

  const actualSha256 = calculateSha256(filePath);
  const verified = actualSha256.toLowerCase() === String(expectedSha256).toLowerCase();

  const state = {
    downloaded: true,
    verified,
    filePath,
    version,
    platform: process.platform,
    expectedSha256,
    actualSha256,
    checkedAt: new Date().toISOString(),
  };
  fs.writeFileSync(installerStatePath, JSON.stringify(state, null, 2));

  if (!verified) {
    return {
      ok: false,
      downloaded: true,
      verified: false,
      error: "Downloaded installer checksum does not match the published checksum. Refusing to run it.",
    };
  }

  return { ok: true, downloaded: true, verified: true, filePath, version, platform: process.platform };
}

// Download the small delta "app bundle" (dist + backend) for the latest version
// and verify its checksum. The launcher applies it in place without reinstalling
// the runtime. Returns { ok, filePath, version } or an error.
async function downloadAppBundle() {
  const latest = await getLatestVersion({ withUrl: true });
  if (!latest.ok) {
    return { ok: false, downloaded: false, error: latest.lastError || "Could not fetch latest version" };
  }

  const info = latest.data;
  const version = info.latestVersion || info.version;
  const bundleUrl = info.appBundleUrl;
  const bundleKey = info.appBundleKey;
  const expectedSha256 = info.appBundleSha256;

  if (!bundleUrl) {
    return { ok: false, downloaded: false, error: "This version has no delta app bundle; use the full installer." };
  }

  fs.mkdirSync(appConfig.updatesDir, { recursive: true });
  const fileName = path
    .basename(bundleKey || `shiksha-sarthi-app-${version}.zip`)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(appConfig.updatesDir, fileName);

  const response = await fetch(bundleUrl);
  if (!response.ok) {
    return { ok: false, downloaded: false, error: `Download failed with HTTP ${response.status}` };
  }

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    response.body.pipe(output);
    response.body.on("error", reject);
    output.on("finish", resolve);
  });

  // Fail closed: never apply app code we can't verify.
  if (!expectedSha256) {
    try { fs.rmSync(filePath, { force: true }); } catch (_e) { /* ignore */ }
    return { ok: false, downloaded: false, error: "App bundle is missing a checksum; refusing to apply." };
  }
  const actualSha256 = calculateSha256(filePath);
  if (actualSha256.toLowerCase() !== String(expectedSha256).toLowerCase()) {
    try { fs.rmSync(filePath, { force: true }); } catch (_e) { /* ignore */ }
    return { ok: false, downloaded: false, error: "App bundle checksum mismatch; download rejected." };
  }

  return { ok: true, downloaded: true, filePath, version };
}

module.exports = {
  checkForUpdate,
  compareSemver,
  downloadAppBundle,
  downloadInstaller,
  downloadUpdatePackage,
  getLatestVersion,
  installerStatePath,
};
