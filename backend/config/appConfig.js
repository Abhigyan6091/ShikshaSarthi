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

function getLanAddress() {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return "<server-ip>";
}

const appConfig = {
  serviceName: "ShikshaSarthi",
  mode: readString("APP_MODE", "local-school"),
  version: readString("APP_VERSION", backendPackageJson.version || "1.0.0"),
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
