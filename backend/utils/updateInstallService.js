const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { appConfig } = require("../config/appConfig");
const { calculateSha256 } = require("./backupService");

const updateStatePath = path.join(path.dirname(appConfig.updatesDir), "update-state.json");
const installStatePath = path.join(path.dirname(appConfig.updatesDir), "install-state.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUpdateState() {
  return {
    update: readJson(updateStatePath),
    install: readJson(installStatePath),
    installEnabled: appConfig.updateInstallEnabled,
    updatesDir: appConfig.updatesDir,
    installDir: appConfig.updateInstallDir,
    rollbackDir: appConfig.updateRollbackDir,
  };
}

function ensureVerifiedDownload() {
  const state = readJson(updateStatePath);
  if (!state || !state.downloaded || !state.verified || !state.filePath) {
    throw new Error("No verified update package is ready. Run /api/update/download first.");
  }

  if (!fs.existsSync(state.filePath)) {
    throw new Error("Verified update package file is missing.");
  }

  const actualSha256 = calculateSha256(state.filePath);
  if (actualSha256.toLowerCase() !== String(state.expectedSha256 || state.actualSha256).toLowerCase()) {
    throw new Error("Downloaded update checksum no longer matches.");
  }

  return { ...state, actualSha256 };
}

function stageUpdatePackage() {
  const state = ensureVerifiedDownload();
  const stagedAt = new Date().toISOString();
  const versionDir = path.join(appConfig.updateInstallDir, String(state.version || "unknown"));
  fs.mkdirSync(versionDir, { recursive: true });

  const stagedPackage = path.join(versionDir, path.basename(state.filePath));
  fs.copyFileSync(state.filePath, stagedPackage);

  const installState = {
    status: "staged",
    version: state.version,
    stagedAt,
    packagePath: stagedPackage,
    sha256: state.actualSha256,
    message: "Update package staged. Run host installer script to apply safely.",
  };

  writeJson(installStatePath, installState);
  return installState;
}

function applyDownloadedUpdate({ confirmInstall = false } = {}) {
  if (!appConfig.updateInstallEnabled) {
    const staged = stageUpdatePackage();
    return {
      applied: false,
      staged: true,
      reason: "UPDATE_INSTALL_ENABLED is false. Package staged only.",
      ...staged,
    };
  }

  if (!confirmInstall) {
    const staged = stageUpdatePackage();
    return {
      applied: false,
      staged: true,
      reason: "confirmInstall=true is required before applying an update.",
      ...staged,
    };
  }

  const staged = stageUpdatePackage();
  const scriptPath = path.resolve(process.env.UPDATE_APPLY_SCRIPT || path.join(__dirname, "..", "..", "scripts", "apply-update.sh"));
  if (!fs.existsSync(scriptPath)) {
    return { applied: false, staged: true, reason: "Host apply script is missing.", ...staged };
  }

  const result = spawnSync(scriptPath, [staged.packagePath], { encoding: "utf8" });
  const applied = result.status === 0;
  const installState = {
    ...staged,
    status: applied ? "applied" : "failed",
    appliedAt: applied ? new Date().toISOString() : null,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
  writeJson(installStatePath, installState);

  return { applied, staged: true, ...installState };
}

function rollbackUpdate({ confirmRollback = false } = {}) {
  if (!confirmRollback) {
    return {
      rolledBack: false,
      reason: "confirmRollback=true is required before rollback.",
      install: readJson(installStatePath),
    };
  }

  const scriptPath = path.resolve(process.env.UPDATE_ROLLBACK_SCRIPT || path.join(__dirname, "..", "..", "scripts", "rollback-update.sh"));
  if (!fs.existsSync(scriptPath)) {
    return { rolledBack: false, reason: "Host rollback script is missing.", install: readJson(installStatePath) };
  }

  const result = spawnSync(scriptPath, [], { encoding: "utf8" });
  const rolledBack = result.status === 0;
  const installState = {
    ...(readJson(installStatePath) || {}),
    status: rolledBack ? "rolled-back" : "rollback-failed",
    rolledBackAt: rolledBack ? new Date().toISOString() : null,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
  writeJson(installStatePath, installState);
  return { rolledBack, ...installState };
}

module.exports = {
  applyDownloadedUpdate,
  getUpdateState,
  rollbackUpdate,
  stageUpdatePackage,
};
