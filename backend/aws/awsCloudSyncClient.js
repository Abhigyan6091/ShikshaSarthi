const fs = require("fs");
const path = require("path");
const { appConfig, request } = require("./awsControlClient");
const {
  applyUploadedChanges,
  fetchPendingChanges,
  markRecordsSynced,
} = require("../sync/syncService");

// Honor APP_STATE_DIR so runtime state is written to a writable location
// (ProgramData) instead of the read-only Program Files install dir.
const DATA_DIR = process.env.APP_STATE_DIR
  ? path.resolve(process.env.APP_STATE_DIR)
  : path.join(__dirname, "..", "data");
const STATE_FILE = path.join(DATA_DIR, "aws-cloud-sync-state.json");

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch (_error) {
    return {};
  }
}

function writeState(patch) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const nextState = {
    ...readState(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

function cloudScope() {
  return String(process.env.AWS_SYNC_SCOPE || "global").trim() || "global";
}

function acceptedIdsByCollection(idsByCollection = {}) {
  return Object.fromEntries(
    Object.entries(idsByCollection)
      .filter(([, ids]) => Array.isArray(ids) && ids.length)
  );
}

function countRecords(collections = {}) {
  return Object.values(collections).reduce(
    (total, records) => total + (Array.isArray(records) ? records.length : 0),
    0
  );
}

async function pushPendingRecords({ collections, limit } = {}) {
  const pending = await fetchPendingChanges({ collections, limit });

  if (!pending.totalRecords) {
    return {
      ok: true,
      skipped: true,
      pendingRecords: 0,
      markedSynced: null,
      push: null,
    };
  }

  const push = await request("/sync/push", {
    method: "POST",
    timeoutMs: Number(process.env.AWS_SYNC_REQUEST_TIMEOUT_MS || 30000),
    body: {
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      scope: cloudScope(),
      appVersion: appConfig.version,
      collections: pending.collections,
    },
  });

  if (!push.ok && push.statusCode !== 207) {
    return {
      ok: false,
      pendingRecords: pending.totalRecords,
      push,
      error: push.lastError || "Cloud sync push failed",
    };
  }

  const idsByCollection = acceptedIdsByCollection(push.data?.idsByCollection || {});
  const markedSynced = Object.keys(idsByCollection).length
    ? await markRecordsSynced({ idsByCollection })
    : null;

  return {
    ok: push.ok || push.statusCode === 207,
    pendingRecords: pending.totalRecords,
    uploadedRecords: push.data?.summary?.received || 0,
    acceptedRecords: countRecords(idsByCollection),
    markedSynced,
    push,
  };
}

async function pullCloudRecords({ collections, limit, forceFull = false } = {}) {
  const state = readState();
  const since = forceFull ? null : state.lastCloudPullAt || null;
  const pull = await request("/sync/pull", {
    method: "POST",
    timeoutMs: Number(process.env.AWS_SYNC_REQUEST_TIMEOUT_MS || 30000),
    body: {
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      scope: cloudScope(),
      appVersion: appConfig.version,
      since,
      limit: limit || Number(process.env.AWS_SYNC_PULL_LIMIT || 500),
      collections,
    },
  });

  if (!pull.ok) {
    return {
      ok: false,
      downloadedRecords: 0,
      applied: null,
      pull,
      error: pull.lastError || "Cloud sync pull failed",
    };
  }

  const downloadedRecords = pull.data?.totalRecords || 0;
  const applied = downloadedRecords > 0
    ? await applyUploadedChanges(
        { collections: pull.data.collections || {} },
        { collections, markSynced: true }
      )
    : { summary: { received: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 }, results: [] };

  const nextState = writeState({
    lastCloudPullAt: pull.data?.serverTime || new Date().toISOString(),
    scope: pull.data?.scope || cloudScope(),
    lastDownloadedRecords: downloadedRecords,
  });

  return {
    ok: true,
    downloadedRecords,
    applied,
    pull,
    state: nextState,
  };
}

async function runCloudMergeSync(options = {}) {
  if (!appConfig.aws.syncEnabled) {
    return {
      ok: false,
      skipped: true,
      reason: "aws-sync-disabled",
    };
  }

  const push = await pushPendingRecords(options);
  if (!push.ok) {
    return {
      ok: false,
      stage: "push",
      push,
      error: push.error || "Cloud sync push failed",
    };
  }

  const pull = await pullCloudRecords(options);
  if (!pull.ok) {
    return {
      ok: false,
      stage: "pull",
      push,
      pull,
      error: pull.error || "Cloud sync pull failed",
    };
  }

  return {
    ok: true,
    scope: cloudScope(),
    push,
    pull,
    summary: {
      pendingRecords: push.pendingRecords || 0,
      acceptedRecords: push.acceptedRecords || 0,
      downloadedRecords: pull.downloadedRecords || 0,
      appliedInserted: pull.applied?.summary?.inserted || 0,
      appliedUpdated: pull.applied?.summary?.updated || 0,
      appliedSkipped: pull.applied?.summary?.skipped || 0,
    },
  };
}

module.exports = {
  pullCloudRecords,
  pushPendingRecords,
  runCloudMergeSync,
};
