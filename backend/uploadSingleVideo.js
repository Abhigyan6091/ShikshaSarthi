const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary credentials are not configured.");
  console.error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to use this optional script.");
  console.error("For local-school mode, store videos under public/videos or uploads instead.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const uploadVideoToCloudinary = async (videoPath, folderName = "nmms_videos") => {
  console.log("Uploading large video to Cloudinary (chunked upload)");
  console.log("Folder:", folderName);
  console.log("File:", videoPath);

  const stats = fs.statSync(videoPath);
  console.log("Size:", (stats.size / (1024 * 1024)).toFixed(2), "MB");

  const result = await cloudinary.uploader.upload(videoPath, {
    resource_type: "video",
    folder: folderName,
    chunk_size: 6000000,
    timeout: 600000,
    eager: [{ quality: "auto", format: "mp4" }],
    eager_async: false,
  });

  console.log("Video uploaded successfully");
  console.log("Video URL:", result.secure_url);
  return result.secure_url;
};

const videoPath = process.argv[2];
if (!videoPath) {
  console.error("Usage: node uploadSingleVideo.js <video-path> [folder]");
  process.exit(1);
}

const absoluteVideoPath = path.resolve(videoPath);
if (!fs.existsSync(absoluteVideoPath)) {
  console.error("Video file not found:", absoluteVideoPath);
  process.exit(1);
}

uploadVideoToCloudinary(absoluteVideoPath, process.argv[3] || "nmms_videos")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upload failed:", error.message);
    process.exit(1);
  });
