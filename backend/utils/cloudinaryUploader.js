const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { appConfig } = require("../config/appConfig");

function ensureCloudinaryConfig() {
  if (!appConfig.cloudinaryEnabled) {
    throw new Error("Cloudinary uploads are disabled in offline mode");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";

  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
  }

  return {
    cloudName,
    uploadPreset,
  };
}

async function uploadBufferToCloudinary(buffer, options = {}) {
  const { cloudName, uploadPreset } = ensureCloudinaryConfig();

  const resourceType = options.resourceType || "auto";
  const folder = options.folder || process.env.CLOUDINARY_SYNC_FOLDER || "offline_sync";
  const fileName = options.fileName || `upload_${Date.now()}`;

  const formData = new FormData();
  formData.append("file", buffer, fileName);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  return payload.secure_url;
}

async function uploadLocalFileToCloudinary(localFilePath, options = {}) {
  const absolutePath = path.resolve(localFilePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local media file does not exist: ${absolutePath}`);
  }

  const buffer = fs.readFileSync(absolutePath);
  const fileName = options.fileName || path.basename(absolutePath);

  return uploadBufferToCloudinary(buffer, {
    ...options,
    fileName,
  });
}

module.exports = {
  uploadBufferToCloudinary,
  uploadLocalFileToCloudinary,
};
