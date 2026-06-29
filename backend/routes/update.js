const express = require("express");
const { checkForUpdate, downloadUpdatePackage } = require("../aws/awsUpdateClient");
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
