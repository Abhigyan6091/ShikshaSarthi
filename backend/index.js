const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Apply sync metadata (updatedAt / isDeleted / synced fields + soft-delete
// filtering) to EVERY schema. This MUST run before any model is compiled: a
// global mongoose plugin only affects schemas registered after it, and several
// requires below (sync services) pull in models. Registering it here — before
// those requires — is what makes soft-delete (and therefore the delete buttons
// for schools/teachers/students/admins) actually take effect.
const syncMetadataPlugin = require("./utils/syncMetadataPlugin");
mongoose.plugin(syncMetadataPlugin);

process.env.APP_MODE = process.env.APP_MODE || "local-school";
process.env.USE_LOCAL_DB = process.env.USE_LOCAL_DB || "true";
process.env.SYNC_AUTO_ENABLED = process.env.SYNC_AUTO_ENABLED || "false";
process.env.SYNC_NODE_ROLE = process.env.SYNC_NODE_ROLE || "local";
process.env.AI_HINTS_ENABLED = process.env.AI_HINTS_ENABLED || "false";
process.env.CLOUDINARY_ENABLED = process.env.CLOUDINARY_ENABLED || "false";
process.env.LOCAL_UPLOADS_ENABLED = process.env.LOCAL_UPLOADS_ENABLED || "true";
process.env.BACKUP_ENABLED = process.env.BACKUP_ENABLED || "true";

const audioCache = require("./utils/audioCache");
const { requireAuth } = require("./middleware/auth");
const { ensureUploadDirectories, UPLOAD_ROOT } = require("./utils/localMediaStore");
const { startAutoSync, getAutoSyncState } = require("./sync/autoSyncService");
const { getAwsAutoSyncState, startAwsAutoSync } = require("./aws/awsAutoSyncService");
const {
  appConfig,
  getDatabaseStatus,
  getLanAddress,
  getMongoUri,
  getPublicStatus,
} = require("./config/appConfig");

const questionRoutes = require("./routes/question");
const quizRoutes = require("./routes/quiz");
const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");
const reportRoutes = require("./routes/report");
const schoolRoutes = require("./routes/school");
const vocabRoutes = require("./routes/vocabularyRoutes");
const superAdminRoutes = require("./routes/superadmin");
const schoolAdminRoutes = require("./routes/schooladmin");
const classRoutes = require("./routes/class");
const videoQuestionRoutes = require("./routes/videoQuestion");
const audioQuestionRoutes = require("./routes/audioQuestions");
const puzzlesRoutes = require("./routes/puzzles");
const matRoutes = require("./routes/mat");
const matTestRoutes = require("./routes/matTest");
const experimentRoutes = require("./routes/experimentRoutes");
const feedbackFormRoutes = require("./routes/feedbackForm");
const feedbackResponseRoutes = require("./routes/feedbackResponse");
const syncRoutes = require("./routes/sync");
const mediaRoutes = require("./routes/media");
const authRoutes = require("./routes/auth");
const updateRoutes = require("./routes/updates");
const phaseTwoUpdateRoutes = require("./routes/update");
const backupRoutes = require("./routes/backup");
const awsRoutes = require("./routes/aws");
const helmet = require("helmet");
const { mongoSanitize, globalRateLimiter } = require("./middleware/security");

const app = express();
// Only 127.0.0.1 is a trusted proxy (nginx in the docker deployment sits on
// loopback); keeps req.ip meaningful without opening up spoofing.
app.set("trust proxy", "loopback");
// Security headers. crossOriginResourcePolicy is relaxed so the LAN app can
// serve uploads/media to classroom devices; CSP is left to the app shell.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(globalRateLimiter);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
// Strip MongoDB operator injection ($-keys / dotted keys) from body & params.
app.use(mongoSanitize);

// Ensure stale audio cache is cleaned at every backend startup.
audioCache.initializeCacheCleanup();
if (appConfig.localUploadsEnabled) {
  ensureUploadDirectories();
}

// Serve static video and uploaded files for offline LAN access.
app.use("/videos", express.static("public/videos"));
app.use("/uploads", express.static(UPLOAD_ROOT));

const { useLocalDb, mongoUri } = getMongoUri();
const sanitizedMongoUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

function hasLegacySyncSource() {
  return Boolean(
    appConfig.syncRemoteUrl ||
      String(process.env.SYNC_SOURCE_URI || "").trim() ||
      String(process.env.MONGO_URI_REMOTE || "").trim()
  );
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB status: connected");
    console.log(`Database mode: ${useLocalDb ? "local" : "remote"}`);
    console.log(`Mongo URI: ${sanitizedMongoUri}`);
    if (appConfig.syncAutoEnabled && hasLegacySyncSource()) {
      startAutoSync();
    } else if (appConfig.syncAutoEnabled) {
      console.log("Legacy direct sync skipped: no SYNC_REMOTE_URL or SYNC_SOURCE_URI configured");
    }
    // One-time data fixes: backfill student batches from class, and clean up
    // profiles orphaned by already-deleted schools.
    require("./utils/dataMigrations").runStartupMigrations();

    // Loud diagnostics: cross-instance sync (question bank + credentials +
    // deletions) rides the AWS cloud path. It silently no-ops if the school's
    // env is missing AWS_SYNC_ENABLED / AWS_CONTROL_API_URL / AWS_CONTROL_API_KEY,
    // which is the most common reason "nothing syncs". Surface it clearly.
    const aws = appConfig.aws || {};
    const missing = [];
    if (!aws.controlApiUrl) missing.push("AWS_CONTROL_API_URL");
    if (!aws.controlApiKey) missing.push("AWS_CONTROL_API_KEY");
    if (!aws.syncEnabled) {
      console.warn(
        `⚠️  Cloud sync DISABLED (AWS_SYNC_ENABLED not true). Question-bank and credential changes/deletions will NOT sync across schools until it is enabled.`
      );
    } else if (missing.length) {
      console.warn(
        `⚠️  Cloud sync ENABLED but NOT configured — missing ${missing.join(", ")}. Sync will fail silently until these are set in the school env.`
      );
    } else {
      console.log(`☁️  Cloud sync configured: scope=${aws.syncScope} schoolId=${aws.schoolId} control=${aws.controlApiUrl}`);
    }
    startAwsAutoSync();
  })
  .catch((err) => {
    console.error("MongoDB status: connection error", err);
  });

app.use("/questions", questionRoutes);
app.use("/quizzes", quizRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/reports", reportRoutes);
app.use("/schools", schoolRoutes);
app.use("/vocab", vocabRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/schooladmin", schoolAdminRoutes);
app.use("/classes", classRoutes);
app.use("/video-questions", videoQuestionRoutes);
app.use("/audio-questions", audioQuestionRoutes);
app.use("/puzzles", puzzlesRoutes);
app.use("/api/mat", matRoutes);
app.use("/api/mat-test", matTestRoutes);
app.use("/api/experiments", experimentRoutes);
app.use("/api/feedback-forms", feedbackFormRoutes);
app.use("/api/feedback-responses", feedbackResponseRoutes);
app.use("/sync", syncRoutes);
app.use("/media", mediaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/updates", updateRoutes);
// These control-plane routes can install software, trigger cloud sync, and
// manage backups, so they require an authenticated superadmin session unless
// the request comes from the local machine (the Electron launcher hub, which
// has no login flow and is already trusted at the OS/physical-access level).
app.use("/api/update", requireAuth("superadmin"), phaseTwoUpdateRoutes);
app.use("/api/backup", requireAuth("superadmin"), backupRoutes);
app.use("/api/aws", requireAuth("superadmin"), awsRoutes);

const frontendDistDir = process.env.FRONTEND_DIST_DIR
  ? path.resolve(process.env.FRONTEND_DIST_DIR)
  : null;
const frontendIndexPath = frontendDistDir ? path.join(frontendDistDir, "index.html") : null;

if (frontendDistDir && fs.existsSync(frontendIndexPath)) {
  app.use(
    express.static(frontendDistDir, {
      setHeaders: (res, filePath) => {
        // index.html must never be cached: it's the file that points at the
        // current content-hashed asset bundle. If a browser caches it, the
        // user keeps running an old JS build after a deploy (which looked like
        // "we fixed the bug but it still happens"). Hashed /assets/* are safe
        // to cache forever since their filename changes on every build.
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (/[\\/]assets[\\/]/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
}

app.get("/health", (_req, res) => {
  const status = getPublicStatus(mongoose, UPLOAD_ROOT);
  res.status(status.ok ? 200 : 503).json({
    ok: status.ok,
    service: status.service,
    mode: status.mode,
    version: status.version,
    database: status.database,
    syncEnabled: status.syncEnabled,
    aiHintsEnabled: status.aiHintsEnabled,
    cloudinaryEnabled: status.cloudinaryEnabled,
    localUploadsEnabled: status.localUploadsEnabled,
    timestamp: status.timestamp,
  });
});

app.get("/app/version", (_req, res) => {
  res.status(200).json({
    version: appConfig.version,
    releaseDate: appConfig.releaseDate,
    mode: appConfig.mode,
    nodeRole: appConfig.nodeRole,
  });
});

app.get("/app/status", (_req, res) => {
  const database = getDatabaseStatus(mongoose);
  const syncState = getAutoSyncState();

  res.status(database.connected ? 200 : 503).json({
    ok: database.connected,
    mode: appConfig.mode,
    version: appConfig.version,
    nodeRole: appConfig.nodeRole,
    database: {
      connected: database.connected,
      name: database.name || "app",
    },
    storage: {
      uploadsPath: UPLOAD_ROOT,
      uploadsEnabled: appConfig.localUploadsEnabled,
    },
    sync: {
      enabled: appConfig.syncAutoEnabled,
      lastRunAt: syncState.lastRunAt || null,
      lastSuccessAt: syncState.lastSuccessAt || null,
      lastError: syncState.lastError || null,
    },
    awsSync: getAwsAutoSyncState(),
    aws: {
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      syncScope: appConfig.aws.syncScope,
    },
    network: {
      localUrl: `http://localhost:${appConfig.frontendPort}`,
      lanUrl: `http://${getLanAddress()}:${appConfig.frontendPort}`,
      frontendPort: appConfig.frontendPort,
    },
    features: {
      aiHints: appConfig.aiHintsEnabled,
      cloudinary: appConfig.cloudinaryEnabled,
      localUploads: appConfig.localUploadsEnabled,
      backup: appConfig.backupEnabled,
    },
  });
});

app.get("/hi", (_req, res) => {
  res.send("Welcome to the NMMS Prep API!");
});

if (frontendDistDir && fs.existsSync(frontendIndexPath)) {
  app.use((_req, res) => {
    // SPA fallback also serves index.html — keep it uncacheable for the same reason.
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (_req, res) => {
    res.send("Backend is working");
  });
}

const PORT = appConfig.port;

app.listen(PORT, "0.0.0.0", () => {
  const lanAddress = getLanAddress();
  console.log("========================================");
  console.log("ShikshaSarthi Local School Server started");
  console.log("Backend status: running");
  console.log(`Local URL: http://localhost:${appConfig.frontendPort}`);
  console.log(`LAN URL: http://${lanAddress}:${appConfig.frontendPort}`);
  console.log(`Mode: ${appConfig.mode}`);
  console.log(`Version: ${appConfig.version}`);
  console.log(`Sync: ${appConfig.syncAutoEnabled ? "enabled" : "disabled"}`);
  console.log(`AI hints: ${appConfig.aiHintsEnabled ? "enabled" : "disabled"}`);
  console.log(`Cloudinary: ${appConfig.cloudinaryEnabled ? "enabled" : "disabled"}`);
  console.log(`Local uploads directory: ${UPLOAD_ROOT}`);
  console.log("========================================");
});
