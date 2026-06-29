const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { appConfig } = require("../config/appConfig");
const { MEDIA_DIRECTORIES, ensureUploadDirectories } = require("./localMediaStore");

function saveAudioBufferLocally(fileBuffer) {
  ensureUploadDirectories();
  const fileName = `audio_${Date.now()}.mp3`;
  const absolutePath = path.join(MEDIA_DIRECTORIES.audios, fileName);
  fs.writeFileSync(absolutePath, fileBuffer);
  return `/uploads/audios/${fileName}`;
}

/**
 * Upload audio buffer to Cloudinary when enabled, otherwise store it locally.
 * @param {Buffer} fileBuffer
 * @returns {Promise<string>}
 */
const uploadToCloudinary = async (fileBuffer) => {
  if (!appConfig.cloudinaryEnabled) {
    return saveAudioBufferLocally(fileBuffer);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";
  if (!cloudName) {
    return saveAudioBufferLocally(fileBuffer);
  }

  const formData = new FormData();
  formData.append("file", fileBuffer, "audio.mp3");
  formData.append("upload_preset", uploadPreset);
  formData.append("resource_type", "video");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.secure_url;
};

module.exports = uploadToCloudinary;
