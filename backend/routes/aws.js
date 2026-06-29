const express = require("express");
const { appConfig, getStatus, request } = require("../aws/awsControlClient");
const { uploadLatestBackup } = require("../aws/awsBackupClient");
const { uploadVideo } = require("../aws/awsVideoClient");
const { getLatestVersion } = require("../aws/awsUpdateClient");
const { manualSyncPlaceholder, sendHeartbeat } = require("../aws/awsSyncClient");
const { pullCloudRecords, pushPendingRecords, runCloudMergeSync } = require("../aws/awsCloudSyncClient");
const { getAwsAutoSyncState, runAwsAutoSyncCycle } = require("../aws/awsAutoSyncService");

const router = express.Router();

router.get("/status", async (_req, res) => {
  try {
    const status = await getStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(200).json({
      enabled: Boolean(appConfig.aws.controlApiUrl),
      reachable: false,
      schoolId: appConfig.aws.schoolId,
      lastCheckedAt: new Date().toISOString(),
      lastError: error.message,
      features: {
        sync: appConfig.aws.syncEnabled,
        backupSync: appConfig.aws.backupSyncEnabled,
        videoSync: appConfig.aws.videoSyncEnabled,
        updateCheck: appConfig.aws.updateCheckEnabled,
      },
    });
  }
});

router.post("/heartbeat", async (_req, res) => {
  const result = await sendHeartbeat();
  res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
});

router.post("/backup/upload-latest", async (_req, res) => {
  try {
    const result = await uploadLatestBackup();
    res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, uploaded: false, error: error.message });
  }
});

router.post("/video/upload", async (req, res) => {
  try {
    const result = await uploadVideo(req.body || {});
    res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
  } catch (error) {
    res.status(400).json({ ok: false, uploaded: false, error: error.message });
  }
});

router.get("/version/latest", async (req, res) => {
  const result = await getLatestVersion({ withUrl: req.query.packageUrl === "true" });
  res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
});

router.post("/sync/manual", async (req, res) => {
  try {
    const result = await runCloudMergeSync(req.body || {});
    res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Manual sync failed.",
      error: error.message,
    });
  }
});

router.post("/sync/export-upload", async (req, res) => {
  try {
    const result = await manualSyncPlaceholder(req.body || {});
    res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Export upload sync failed.",
      error: error.message,
    });
  }
});

router.post("/sync/push", async (req, res) => {
  try {
    const result = await pushPendingRecords(req.body || {});
    res.status(result.ok ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/sync/pull", async (req, res) => {
  try {
    const result = await pullCloudRecords(req.body || {});
    res.status(result.ok ? 200 : 502).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/school/status", async (_req, res) => {
  const result = await request(`/school/${encodeURIComponent(appConfig.aws.schoolId)}/status`, {
    method: "GET",
  });
  res.status(result.ok ? 200 : result.enabled === false ? 200 : 502).json(result);
});

router.get("/sync/status", (_req, res) => {
  res.status(200).json(getAwsAutoSyncState());
});

router.post("/sync/run", async (req, res) => {
  runAwsAutoSyncCycle({ trigger: req.body?.trigger || "api" })
    .then((result) => res.status(result.ok ? 200 : result.skipped ? 202 : 502).json(result))
    .catch((error) => res.status(500).json({ ok: false, error: error.message }));
});

module.exports = router;
