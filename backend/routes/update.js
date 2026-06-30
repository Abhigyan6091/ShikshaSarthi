const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const express = require("express");
const { appConfig } = require("../config/appConfig");
const { checkForUpdate, downloadInstaller, downloadUpdatePackage } = require("../aws/awsUpdateClient");
const { applyDownloadedUpdate, getUpdateState, rollbackUpdate } = require("../utils/updateInstallService");

const router = express.Router();

router.get("/check", async (_req, res) => {
  try {
    const result = await checkForUpdate();
    res.status(200).json(result);
  } catch (error) {
    res.status(200).json({
      currentVersion: process.env.APP_VERSION || "1.0.0",
      latestVersion: process.env.APP_VERSION || "1.0.0",
      updateAvailable: false,
      mandatory: false,
      releaseNotes: [],
      downloadReady: false,
      lastError: error.message,
    });
  }
});

router.post("/download", async (_req, res) => {
  try {
    const result = await downloadUpdatePackage();
    res.status(result.downloaded && result.verified ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({ downloaded: false, verified: false, error: error.message });
  }
});

// Download the OS-appropriate desktop installer (.exe/.deb) for the latest version.
router.post("/download-installer", async (_req, res) => {
  try {
    const result = await downloadInstaller();
    res.status(result.ok ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, downloaded: false, error: error.message });
  }
});

// Launch a previously downloaded installer. The installer stops the running app,
// replaces only the program files, and preserves all ProgramData (DB/media/backups).
router.post("/install-now", async (req, res) => {
  try {
    const requested = req.body?.filePath;
    const updatesDir = path.resolve(appConfig.updatesDir);
    const filePath = requested ? path.resolve(requested) : null;

    if (!filePath || !filePath.startsWith(updatesDir) || !fs.existsSync(filePath)) {
      return res.status(400).json({ ok: false, error: "Installer file was not found. Download the update again." });
    }

    if (process.platform === "win32") {
      const child = spawn(filePath, [], { detached: true, stdio: "ignore" });
      child.unref();
      return res.status(200).json({ ok: true, launched: true, message: "Installer started. The app will close to finish updating." });
    }

    // Linux: cannot silently install a .deb without elevation; hand the path back.
    return res.status(200).json({
      ok: true,
      launched: false,
      filePath,
      message: "Installer downloaded. Run it from your file manager to finish updating.",
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/state", (_req, res) => {
  try {
    res.status(200).json(getUpdateState());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/apply", async (req, res) => {
  try {
    const result = applyDownloadedUpdate({ confirmInstall: req.body?.confirmInstall === true });
    res.status(result.applied ? 200 : 202).json(result);
  } catch (error) {
    res.status(400).json({ applied: false, error: error.message });
  }
});

router.post("/rollback", async (req, res) => {
  try {
    const result = rollbackUpdate({ confirmRollback: req.body?.confirmRollback === true });
    res.status(result.rolledBack ? 200 : 202).json(result);
  } catch (error) {
    res.status(400).json({ rolledBack: false, error: error.message });
  }
});

module.exports = router;
