const { appConfig } = require("../config/appConfig");
const { manualSyncPlaceholder, sendHeartbeat } = require("./awsSyncClient");

const DEFAULT_INTERVAL_MS = Number(process.env.AWS_SYNC_INTERVAL_MS || 60_000);
const DEFAULT_START_DELAY_MS = Number(process.env.AWS_SYNC_START_DELAY_MS || 10_000);

let intervalId = null;
let running = false;

const state = {
  enabled: false,
  inProgress: false,
  intervalMs: DEFAULT_INTERVAL_MS,
  lastRunAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastUpload: null,
};

function getAwsAutoSyncState() {
  return {
    ...state,
    enabled: Boolean(appConfig.aws.syncEnabled),
    schoolId: appConfig.aws.schoolId,
    nodeId: appConfig.aws.nodeId,
  };
}

async function runAwsAutoSyncCycle({ trigger = "auto" } = {}) {
  if (!appConfig.aws.syncEnabled) {
    state.enabled = false;
    state.lastError = "AWS sync is disabled";
    return { ok: false, skipped: true, reason: "aws-sync-disabled", state: getAwsAutoSyncState() };
  }

  if (running) {
    return { ok: false, skipped: true, reason: "in-progress", state: getAwsAutoSyncState() };
  }

  running = true;
  state.enabled = true;
  state.inProgress = true;
  state.lastRunAt = new Date().toISOString();
  state.lastError = null;

  try {
    const heartbeat = await sendHeartbeat();
    const sync = await manualSyncPlaceholder({ mode: "pending", trigger });

    state.lastUpload = {
      uploaded: Boolean(sync.uploaded),
      totalRecords: sync.export?.totalRecords || 0,
      key: sync.export?.key || null,
      checkedAt: new Date().toISOString(),
    };

    if (!sync.ok && !sync.uploaded) {
      throw new Error(sync.message || sync.upload?.lastError || sync.complete?.lastError || "AWS sync upload failed");
    }

    state.lastSuccessAt = new Date().toISOString();
    return { ok: true, trigger, heartbeat, sync, state: getAwsAutoSyncState() };
  } catch (error) {
    state.lastError = error.message;
    return { ok: false, trigger, error: error.message, state: getAwsAutoSyncState() };
  } finally {
    running = false;
    state.inProgress = false;
  }
}

function startAwsAutoSync() {
  if (intervalId || !appConfig.aws.syncEnabled) {
    return;
  }

  setTimeout(() => {
    runAwsAutoSyncCycle({ trigger: "startup" }).catch((error) => {
      state.lastError = error.message;
    });
  }, DEFAULT_START_DELAY_MS);

  intervalId = setInterval(() => {
    runAwsAutoSyncCycle({ trigger: "interval" }).catch((error) => {
      state.lastError = error.message;
    });
  }, DEFAULT_INTERVAL_MS);

  console.log(`AWS auto sync started (every ${DEFAULT_INTERVAL_MS}ms)`);
}

module.exports = {
  getAwsAutoSyncState,
  runAwsAutoSyncCycle,
  startAwsAutoSync,
};
