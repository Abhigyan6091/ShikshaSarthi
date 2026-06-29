const fs = require("fs");
const path = require("path");
const { appConfig } = require("./awsControlClient");
const { request } = require("./awsControlClient");
const { putFile } = require("./awsBackupClient");
const { UPLOAD_ROOT } = require("../utils/localMediaStore");
const { calculateSha256 } = require("../utils/backupService");

function resolveAllowedVideoPath(localPath) {
  const videosRoot = path.resolve(process.env.VIDEO_UPLOAD_DIR || path.join(UPLOAD_ROOT, "videos"));
  const absolute = path.resolve(localPath);

  if (!absolute.startsWith(`${videosRoot}${path.sep}`) && absolute !== videosRoot) {
    throw new Error("Video path must be inside the local uploads/videos folder");
  }

  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    throw new Error("Video file does not exist");
  }

  return absolute;
}

async function uploadVideo({ localPath, fileName, contentType = "video/mp4" }) {
  if (!appConfig.aws.videoSyncEnabled) {
    return { ok: false, uploaded: false, message: "Video sync is disabled" };
  }

  const absolute = resolveAllowedVideoPath(localPath);
  const safeFileName = fileName || path.basename(absolute);
  const sha256 = calculateSha256(absolute);
  const size = fs.statSync(absolute).size;

  const presign = await request("/video/request-upload-url", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      fileName: safeFileName,
      contentType,
      sha256,
    },
  });

  if (!presign.ok) {
    return { ok: false, uploaded: false, stage: "request-upload-url", ...presign };
  }

  await putFile(presign.data.uploadUrl, absolute, contentType);

  const complete = await request("/video/complete", {
    method: "POST",
    body: {
      schoolId: appConfig.aws.schoolId,
      key: presign.data.key,
      fileName: safeFileName,
      sha256,
      size,
      appVersion: appConfig.version,
      timestamp: new Date().toISOString(),
    },
  });

  return { ok: complete.ok, uploaded: complete.ok, key: presign.data.key, sha256, size, complete };
}

module.exports = { uploadVideo, resolveAllowedVideoPath };
