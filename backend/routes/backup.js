const express = require("express");
const { createBackup, latestBackupResponse, listBackups } = require("../utils/backupService");

const router = express.Router();

function requireSuperAdmin(req, res, next) {
  const role = String(
    req.headers["x-user-role"] || req.body?.role || req.body?.userRole || req.query?.role || ""
  ).toLowerCase();

  if (role === "superadmin" || role === "super-admin") {
    return next();
  }

  return res.status(403).json({
    error: "Super Admin access required",
    todo: "Replace this header/body role check with the app's real auth middleware when session tokens are standardized.",
  });
}

router.post("/create", requireSuperAdmin, async (_req, res) => {
  try {
    const backup = await createBackup();
    res.status(201).json({
      filename: backup.filename,
      path: backup.path,
      size: backup.size,
      createdAt: backup.createdAt,
      database: backup.database,
      uploads: backup.uploads,
    });
  } catch (error) {
    console.error("Backup creation failed:", error);
    res.status(500).json({ error: "Backup creation failed", message: error.message });
  }
});

router.get("/list", requireSuperAdmin, (_req, res) => {
  try {
    res.status(200).json({ backups: listBackups() });
  } catch (error) {
    console.error("Backup listing failed:", error);
    res.status(500).json({ error: "Backup listing failed", message: error.message });
  }
});

router.get("/latest", (_req, res) => {
  try {
    const latest = latestBackupResponse();
    if (!latest) {
      return res.status(404).json({ ok: false, message: "No local backups found" });
    }
    return res.status(200).json({ ok: true, backup: latest });
  } catch (error) {
    console.error("Latest backup lookup failed:", error);
    return res.status(500).json({ ok: false, error: "Latest backup lookup failed", message: error.message });
  }
});

module.exports = router;
