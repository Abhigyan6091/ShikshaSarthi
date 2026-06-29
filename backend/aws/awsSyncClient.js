const fs = require("fs");
const path = require("path");
const { EJSON } = require("bson");
const { appConfig, request } = require("./awsControlClient");
const { putFile } = require("./awsBackupClient");
const { calculateSha256 } = require("../utils/backupService");
const { fetchPendingChanges, fetchDeltaChanges, markRecordsSynced } = require("../sync/syncService");

const syncExportPath = path.resolve(process.env.SYNC_EXPORT_PATH || path.join(__dirname, "..", "data", "sync-export.json"));
const syncExportDir = path.resolve(process.env.SYNC_EXPORT_DIR || path.join(__dirname, "..", "data", "sync-exports"));

function boolEnv(name, defaultValue = false) {
  const value = process.env[name];
  if (typeof value === "undefined" || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function sendHeartbeat() {
  return request("/school/heartbeat", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      currentVersion: appConfig.version,
      mode: appConfig.mode,
      timestamp: new Date().toISOString(),
      syncEnabled: appConfig.aws.syncEnabled,
    },
  });
}

function collectSyncedIds(collections = {}) {
  const idsByCollection = {};
  Object.entries(collections).forEach(([collectionName, records]) => {
    const ids = (records || [])
      .map((record) => normalizeRecordId(record && record._id))
      .filter(Boolean);
    if (ids.length) idsByCollection[collectionName] = ids;
  });
  return idsByCollection;
}

function normalizeRecordId(id) {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id.toHexString === "function") return id.toHexString();
  if (id.$oid) return String(id.$oid);
  if (id.buffer) {
    const bytes = Array.isArray(id.buffer)
      ? id.buffer
      : Object.keys(id.buffer)
        .sort((left, right) => Number(left) - Number(right))
        .map((key) => id.buffer[key]);
    if (bytes.length) {
      return bytes.map((byte) => Number(byte).toString(16).padStart(2, "0")).join("");
    }
  }
  if (id._id && id._id !== id) return normalizeRecordId(id._id);
  if (id.id && id.id !== id) return normalizeRecordId(id.id);

  const value = String(id);
  return value === "[object Object]" ? null : value;
}

function countRecords(collections = {}) {
  return Object.values(collections).reduce((total, records) => total + (Array.isArray(records) ? records.length : 0), 0);
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function createSyncExport({ collections, limit, mode = "pending" } = {}) {
  fs.mkdirSync(syncExportDir, { recursive: true });

  const result = mode === "delta"
    ? await fetchDeltaChanges({ collections, limit })
    : await fetchPendingChanges({ collections, limit });

  const createdAt = new Date();
  const payload = {
    ok: true,
    type: "record-sync-export",
    mode,
    schoolId: appConfig.aws.schoolId,
    nodeId: appConfig.aws.nodeId,
    appVersion: appConfig.version,
    createdAt: createdAt.toISOString(),
    limit: result.limit,
    totalRecords: result.totalRecords,
    collections: result.collections,
  };

  const fileName = `sync-${appConfig.aws.schoolId}-${timestampForFile(createdAt)}.json`;
  const filePath = path.join(syncExportDir, fileName);
  fs.writeFileSync(filePath, EJSON.stringify(payload, null, 2));

  return {
    fileName,
    filePath,
    contentType: "application/json",
    sha256: calculateSha256(filePath),
    size: fs.statSync(filePath).size,
    totalRecords: result.totalRecords,
    collections: result.collections,
    idsByCollection: collectSyncedIds(result.collections),
  };
}

async function uploadSyncExport(exportInfo) {
  const presign = await request("/sync/request-upload-url", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      fileName: exportInfo.fileName,
      contentType: exportInfo.contentType,
      sha256: exportInfo.sha256,
    },
  });

  if (!presign.ok) {
    return { ok: false, stage: "request-upload-url", ...presign };
  }

  await putFile(presign.data.uploadUrl, exportInfo.filePath, exportInfo.contentType);
  return { ok: true, key: presign.data.key, bucket: presign.data.bucket, expiresIn: presign.data.expiresIn };
}

async function manualSyncPlaceholder(options = {}) {
  if (!appConfig.aws.syncEnabled) {
    return {
      ok: false,
      uploaded: false,
      message: "AWS record sync is disabled. Set AWS_SYNC_ENABLED=true to upload sync exports.",
    };
  }

  let exportInfo = null;
  if (fs.existsSync(syncExportPath) && options.useLegacyExport) {
    exportInfo = {
      fileName: path.basename(syncExportPath),
      filePath: syncExportPath,
      contentType: "application/json",
      sha256: calculateSha256(syncExportPath),
      size: fs.statSync(syncExportPath).size,
      totalRecords: 0,
      collections: {},
      idsByCollection: {},
    };
  } else {
    exportInfo = await createSyncExport({
      collections: options.collections,
      limit: options.limit,
      mode: options.mode || "pending",
    });
  }

  const upload = await uploadSyncExport(exportInfo);
  if (!upload.ok) {
    return {
      ok: false,
      uploaded: false,
      message: "Sync export upload failed",
      export: {
        fileName: exportInfo.fileName,
        sha256: exportInfo.sha256,
        totalRecords: exportInfo.totalRecords,
      },
      upload,
    };
  }

  let markedSynced = null;
  if (boolEnv("AWS_SYNC_MARK_UPLOADED_RECORDS", false) && exportInfo.totalRecords > 0) {
    markedSynced = await markRecordsSynced({ idsByCollection: exportInfo.idsByCollection });
  }

  const complete = await request("/sync/complete", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      type: "manual-record-export",
      status: "completed",
      message: "Record sync export uploaded to S3. Bidirectional cloud merge remains guarded.",
      recordsUploaded: exportInfo.totalRecords,
      recordsDownloaded: 0,
      appVersion: appConfig.version,
      timestamp: new Date().toISOString(),
      uploadKey: upload.key,
    },
  });

  return {
    ok: complete.ok,
    uploaded: upload.ok,
    message: "Record sync export uploaded to AWS S3.",
    export: {
      fileName: exportInfo.fileName,
      key: upload.key,
      sha256: exportInfo.sha256,
      size: exportInfo.size,
      totalRecords: exportInfo.totalRecords,
    },
    markedSynced,
    complete,
  };
}

module.exports = { createSyncExport, manualSyncPlaceholder, sendHeartbeat, uploadSyncExport };
