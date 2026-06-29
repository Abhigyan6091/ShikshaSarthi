const express = require("express");
const router = express.Router();
const {
  saveBase64Media,
  resolveLocalAbsolutePath,
  resolveMediaType,
} = require("../utils/localMediaStore");
const { uploadLocalFileToCloudinary } = require("../utils/cloudinaryUploader");
const { SYNC_MODELS } = require("../sync/modelRegistry");
const { appConfig } = require("../config/appConfig");

function resolveCloudinaryResourceType(resourceType, mimeType) {
  if (resourceType) {
    return resourceType;
  }

  const mediaType = resolveMediaType(null, mimeType);
  if (mediaType === "images") {
    return "image";
  }

  if (mediaType === "videos" || mediaType === "audios") {
    return "video";
  }

  return "auto";
}

function rejectWhenCloudinaryDisabled(res) {
  if (appConfig.cloudinaryEnabled) {
    return false;
  }

  res.status(503).json({
    message: "Cloudinary uploads are disabled in offline mode",
    cloudUrl: null,
  });
  return true;
}

router.post("/upload", async (req, res) => {
  try {
    if (!appConfig.localUploadsEnabled) {
      return res.status(503).json({ message: "Local uploads are disabled" });
    }

    const { base64Data, fileName, mimeType, mediaType } = req.body || {};

    if (!base64Data || !fileName) {
      return res.status(400).json({
        message: "base64Data and fileName are required",
      });
    }

    const saved = saveBase64Media({
      base64Data,
      fileName,
      mimeType,
      mediaType,
    });

    return res.status(201).json({
      message: "Media saved locally",
      mediaType: saved.mediaType,
      fileName: saved.fileName,
      localPath: saved.localPath,
      localUrl: saved.localUrl,
      cloudUrl: null,
      synced: false,
      sizeInBytes: saved.byteSize,
    });
  } catch (error) {
    console.error("Local media upload failed:", error);
    return res.status(500).json({ message: "Local media upload failed", error: error.message });
  }
});

router.post("/cloud-upload", async (req, res) => {
  try {
    if (rejectWhenCloudinaryDisabled(res)) return;

    const { localPath, resourceType, folder } = req.body || {};

    if (!localPath) {
      return res.status(400).json({ message: "localPath is required" });
    }

    const absolutePath = resolveLocalAbsolutePath(localPath);
    const cloudUrl = await uploadLocalFileToCloudinary(absolutePath, {
      resourceType: resolveCloudinaryResourceType(resourceType, req.body?.mimeType),
      folder,
    });

    return res.status(200).json({
      message: "Media uploaded to Cloudinary",
      localPath,
      cloudUrl,
    });
  } catch (error) {
    console.error("Cloud media upload failed:", error);
    return res.status(500).json({ message: "Cloud media upload failed", error: error.message });
  }
});

// Helper endpoint for media sync: upload local file to cloud and store cloudUrl on record.
router.post("/sync-record", async (req, res) => {
  try {
    if (rejectWhenCloudinaryDisabled(res)) return;

    const { collection, id, localPath, resourceType, folder, cloudUrlField = "cloudUrl" } = req.body || {};

    if (!collection || !id || !localPath) {
      return res.status(400).json({ message: "collection, id and localPath are required" });
    }

    const model = SYNC_MODELS[collection];
    if (!model) {
      return res.status(400).json({ message: `Unsupported collection: ${collection}` });
    }

    const absolutePath = resolveLocalAbsolutePath(localPath);
    const cloudUrl = await uploadLocalFileToCloudinary(absolutePath, {
      resourceType: resolveCloudinaryResourceType(resourceType, req.body?.mimeType),
      folder,
    });

    const updatePayload = {
      [cloudUrlField]: cloudUrl,
      cloudUrl,
      localPath,
    };

    const updated = await model.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: false,
      includeDeleted: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.status(200).json({
      message: "Media synced to cloud and record updated",
      collection,
      id,
      cloudUrl,
      record: updated,
    });
  } catch (error) {
    console.error("Media record sync failed:", error);
    return res.status(500).json({ message: "Media record sync failed", error: error.message });
  }
});

module.exports = router;
