const fs = require("fs");
const fetch = require("node-fetch");
const { request, appConfig } = require("./awsControlClient");
const { ensureLatestBackupPackage } = require("../utils/backupService");

async function putFile(uploadUrl, filePath, contentType) {
  const stats = fs.statSync(filePath);
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      ...(contentType ? { "content-type": contentType } : {}),
      "content-length": String(stats.size),
    },
    body: fs.createReadStream(filePath),
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with HTTP ${response.status}`);
  }
}

async function uploadLatestBackup() {
  if (!appConfig.aws.backupSyncEnabled) {
    return { ok: false, uploaded: false, message: "Backup sync is disabled" };
  }

  const backup = await ensureLatestBackupPackage();
  const backupPackage = backup.package;
  if (!backupPackage?.path || !fs.existsSync(backupPackage.path)) {
    throw new Error("Latest backup package is missing");
  }

  const presign = await request("/backup/request-upload-url", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      fileName: backupPackage.fileName,
      contentType: backupPackage.contentType,
      sha256: backupPackage.sha256,
    },
  });

  if (!presign.ok) {
    return { ok: false, uploaded: false, stage: "request-upload-url", ...presign };
  }

  await putFile(presign.data.uploadUrl, backupPackage.path, backupPackage.contentType);

  const complete = await request("/backup/complete", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      key: presign.data.key,
      fileName: backupPackage.fileName,
      sha256: backupPackage.sha256,
      appVersion: appConfig.version,
      size: backupPackage.size,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    ok: complete.ok,
    uploaded: complete.ok,
    backup: {
      fileName: backupPackage.fileName,
      sha256: backupPackage.sha256,
      key: presign.data.key,
      size: backupPackage.size,
    },
    complete,
  };
}

module.exports = { uploadLatestBackup, putFile };
