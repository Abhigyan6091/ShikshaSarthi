const os = require("os");
const path = require("path");
const backendPackageJson = require("../package.json");

function readBoolean(name, defaultValue = false) {
  const rawValue = process.env[name];
  if (typeof rawValue === "undefined" || rawValue === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(rawValue).trim().toLowerCase());
}

function readString(name, defaultValue = "") {
  const value = process.env[name];
  if (typeof value === "undefined" || value === null || value === "") {
    return defaultValue;
  }
  return String(value);
}

function resolveAppVersion() {
  const packagedVersion = backendPackageJson.version || "1.0.0";

  // APP_VERSION used to be copied into installed .env files, so older school
  // servers can keep reporting 1.0.0 after a successful program update. Use
  // the packaged backend version as the source of truth; APP_VERSION_OVERRIDE
  // remains available for an intentional operator/CI override.
  return readString("APP_VERSION_OVERRIDE", packagedVersion);
}

function getLanAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const address of addresses || []) {
      if (address.family !== "IPv4" || address.internal) continue;
      if (isIgnoredInterface(name) || isIgnoredAddress(address.address)) continue;

      candidates.push({
        address: address.address,
        score: scoreLanAddress(name, address.address),
      });
    }
  }

  candidates.sort((left, right) => right.score - left.score);
  if (candidates[0]) return candidates[0].address;

  return "<server-ip>";
}

function isIgnoredInterface(name = "") {
  const normalized = String(name).toLowerCase();
  return (
    normalized.includes("docker") ||
    normalized.startsWith("br-") ||
    normalized.startsWith("veth") ||
    normalized.startsWith("virbr") ||
    normalized.startsWith("tailscale") ||
    normalized.startsWith("zt") ||
    normalized.startsWith("wg") ||
    normalized.startsWith("tun") ||
    normalized.startsWith("tap") ||
    normalized.startsWith("ogstun")
  );
}

function isIgnoredAddress(address = "") {
  return address.startsWith("169.254.") || address.startsWith("100.");
}

function isPrivateLanAddress(address = "") {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function scoreLanAddress(name, address) {
  let score = 0;
  if (isPrivateLanAddress(address)) score += 100;
  if (/^(wl|wlan|wifi|en|eth)/i.test(name)) score += 50;
  return score;
}

const appConfig = {
  serviceName: "ShikshaSarthi",
  mode: readString("APP_MODE", "local-school"),
  version: resolveAppVersion(),
  releaseDate: readString("APP_RELEASE_DATE", null),
  port: Number(process.env.PORT || process.env.BACKEND_PORT || 5000),
  frontendPort: Number(process.env.FRONTEND_PORT || 6050),
  nodeRole: readString("SYNC_NODE_ROLE", "local"),
  syncAutoEnabled: readBoolean("SYNC_AUTO_ENABLED", false),
  syncRemoteUrl: readString("SYNC_REMOTE_URL", ""),
  aiHintsEnabled: readBoolean("AI_HINTS_ENABLED", false),
  cloudinaryEnabled: readBoolean("CLOUDINARY_ENABLED", false),
  localUploadsEnabled: readBoolean("LOCAL_UPLOADS_ENABLED", true),
  backupEnabled: readBoolean("BACKUP_ENABLED", true),
  backupRetentionDays: Number(process.env.BACKUP_RETENTION_DAYS || 14),
  backupDir: path.resolve(process.env.BACKUP_DIR || path.join(__dirname, "..", "backups")),
  aws: {
    controlApiUrl: readString("AWS_CONTROL_API_URL", ""),
    controlApiKey: readString("AWS_CONTROL_API_KEY", ""),
    schoolId: readString("AWS_SCHOOL_ID", "SCHOOL001"),
    nodeId: readString("AWS_NODE_ID", readString("AWS_SCHOOL_ID", "SCHOOL001") + "-LAB-01"),
    updatesBucket: readString("AWS_UPDATES_BUCKET", ""),
    schoolDataBucket: readString("AWS_SCHOOL_DATA_BUCKET", ""),
    syncEnabled: readBoolean("AWS_SYNC_ENABLED", false),
    backupSyncEnabled: readBoolean("AWS_BACKUP_SYNC_ENABLED", true),
    videoSyncEnabled: readBoolean("AWS_VIDEO_SYNC_ENABLED", true),
    updateCheckEnabled: readBoolean("AWS_UPDATE_CHECK_ENABLED", true),
    updateChannel: readString("AWS_UPDATE_CHANNEL", "stable"),
    syncScope: readString("AWS_SYNC_SCOPE", "global"),
  },
  updatesDir: path.resolve(process.env.UPDATE_DOWNLOAD_DIR || path.join(__dirname, "..", "updates", "downloaded")),
  updateInstallEnabled: readBoolean("UPDATE_INSTALL_ENABLED", false),
  updateInstallDir: path.resolve(process.env.UPDATE_INSTALL_DIR || path.join(__dirname, "..", "updates", "staged")),
  updateRollbackDir: path.resolve(process.env.UPDATE_ROLLBACK_DIR || path.join(__dirname, "..", "updates", "rollback")),
};

function getMongoUri() {
  const useLocalDb = readBoolean("USE_LOCAL_DB", true);
  const localUri = readString("MONGO_URI_LOCAL", "mongodb://127.0.0.1:27017/app");
  const primaryUri = readString("MONGO_URI", localUri);

  return {
    useLocalDb,
    mongoUri: useLocalDb ? localUri : primaryUri || localUri,
  };
}

function getDatabaseStatus(mongoose) {
  const readyState = mongoose.connection.readyState;
  const connected = readyState === 1;

  return {
    connected,
    status: connected ? "connected" : readyState === 2 ? "connecting" : "disconnected",
    name: mongoose.connection.name || null,
  };
}

function getPublicStatus(mongoose, uploadRoot) {
  const database = getDatabaseStatus(mongoose);

  return {
    ok: database.connected,
    service: appConfig.serviceName,
    mode: appConfig.mode,
    version: appConfig.version,
    database: database.status,
    syncEnabled: appConfig.syncAutoEnabled,
    aiHintsEnabled: appConfig.aiHintsEnabled,
    cloudinaryEnabled: appConfig.cloudinaryEnabled,
    localUploadsEnabled: appConfig.localUploadsEnabled,
    timestamp: new Date().toISOString(),
    uploadRoot,
  };
}

module.exports = {
  appConfig,
  getLanAddress,
  getMongoUri,
  getDatabaseStatus,
  getPublicStatus,
  readBoolean,
};
