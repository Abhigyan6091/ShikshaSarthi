const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const audioCache = require("./utils/audioCache");
const syncMetadataPlugin = require("./utils/syncMetadataPlugin");
const { ensureUploadDirectories, UPLOAD_ROOT } = require("./utils/localMediaStore");
const { startAutoSync } = require("./sync/autoSyncService");

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
const authRoutes = require('./routes/auth');
const updateRoutes = require('./routes/updates');
const vqgRouter = require("./vqgRouter");
const backendPackageJson = require("./package.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Ensure stale audio cache is cleaned at every backend startup.
audioCache.initializeCacheCleanup();
ensureUploadDirectories();

// Serve static video files for offline access
app.use('/videos', express.static('public/videos'));
app.use("/uploads", express.static(UPLOAD_ROOT));

const useLocalDb = process.env.USE_LOCAL_DB !== "false";
const mongoUri = useLocalDb
  ? process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/app"
  : process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/app";
const sanitizedMongoUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(`📦 Database mode: ${useLocalDb ? "local" : "cloud"}`);
    console.log(`🗄️ Mongo URI: ${sanitizedMongoUri}`);
    startAutoSync();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
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
app.use('/api/updates', updateRoutes);

// ── VQG (Video Question Generator) ────────────────────────────
// Mounts the VQG router which manages the FastAPI subprocess and
// serves the VQG frontend + API under /vqg/*
app.use("/vqg", vqgRouter);

// https://shiksha-sarthi-nmms-prep-cn64.vercel.app

app.get("/app/version", (_req, res) => {
  res.status(200).json({
    version: process.env.APP_VERSION || backendPackageJson.version,
    nodeRole: process.env.SYNC_NODE_ROLE || "local",
    releaseDate: process.env.APP_RELEASE_DATE || null,
  });
});

app.get("/hi", (req, res) => {
  res.send("Welcome to the NMMS Prep API!");
});

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces for LAN access
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 LAN Access: http://0.0.0.0:${PORT}`);
  console.log(`📂 Local uploads directory: ${UPLOAD_ROOT}`);
});
