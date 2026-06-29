const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

process.env.APP_MODE = process.env.APP_MODE || "local-school";
process.env.USE_LOCAL_DB = process.env.USE_LOCAL_DB || "true";
process.env.SYNC_AUTO_ENABLED = process.env.SYNC_AUTO_ENABLED || "false";
process.env.SYNC_NODE_ROLE = process.env.SYNC_NODE_ROLE || "local";
process.env.AI_HINTS_ENABLED = process.env.AI_HINTS_ENABLED || "false";
process.env.CLOUDINARY_ENABLED = process.env.CLOUDINARY_ENABLED || "false";
process.env.LOCAL_UPLOADS_ENABLED = process.env.LOCAL_UPLOADS_ENABLED || "true";
process.env.BACKUP_ENABLED = process.env.BACKUP_ENABLED || "true";

const audioCache = require("./utils/audioCache");
const syncMetadataPlugin = require("./utils/syncMetadataPlugin");
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

// Apply sync metadata behavior to every schema before models are imported.
mongoose.plugin(syncMetadataPlugin);

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
const vqgRouter = require("./vqgRouter");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

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

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB status: connected");
    console.log(`Database mode: ${useLocalDb ? "local" : "remote"}`);
    console.log(`Mongo URI: ${sanitizedMongoUri}`);
    startAutoSync();
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
app.use("/api/update", phaseTwoUpdateRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/aws", awsRoutes);

// Mounts the VQG router which manages the FastAPI subprocess and
// serves the VQG frontend + API under /vqg/*.
app.use("/vqg", vqgRouter);

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

app.get("/", (_req, res) => {
  res.send("Backend is working");
});

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
