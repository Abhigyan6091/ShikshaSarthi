const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROJECT_ROOT = path.join(__dirname, "..", "..");
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_ROOT || path.join(PROJECT_ROOT, "uploads"));

const MEDIA_DIRECTORIES = {
  images: path.join(UPLOAD_ROOT, "images"),
  videos: path.join(UPLOAD_ROOT, "videos"),
  audios: path.join(UPLOAD_ROOT, "audios"),
};

function ensureUploadDirectories() {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  Object.values(MEDIA_DIRECTORIES).forEach((directoryPath) => {
    fs.mkdirSync(directoryPath, { recursive: true });
  });
}

function resolveMediaType(inputMediaType, mimeType = "") {
  const normalizedMediaType = String(inputMediaType || "").trim().toLowerCase();
  if (["images", "videos", "audios"].includes(normalizedMediaType)) {
    return normalizedMediaType;
  }

  const normalizedMime = String(mimeType || "").toLowerCase();
  if (normalizedMime.startsWith("image/")) return "images";
  if (normalizedMime.startsWith("video/")) return "videos";
  if (normalizedMime.startsWith("audio/")) return "audios";

  return "images";
}

function sanitizeFileName(fileName) {
  const rawName = String(fileName || "file");
  const baseName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, "_");
  return baseName || "file";
}

function guessExtension(fileName, mimeType = "") {
  const safeName = sanitizeFileName(fileName);
  const ext = path.extname(safeName);
  if (ext) {
    return ext;
  }

  const mimeToExt = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg",
  };

  return mimeToExt[String(mimeType || "").toLowerCase()] || ".bin";
}

function decodeBase64Payload(base64Data) {
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("base64Data is required");
  }

  const normalized = base64Data.includes(",")
    ? base64Data.slice(base64Data.indexOf(",") + 1)
    : base64Data;

  return Buffer.from(normalized, "base64");
}

function saveBase64Media({ base64Data, fileName, mimeType, mediaType }) {
  ensureUploadDirectories();

  const resolvedType = resolveMediaType(mediaType, mimeType);
  const extension = guessExtension(fileName, mimeType);
  const safeBaseName = path.basename(sanitizeFileName(fileName), path.extname(fileName || ""));
  const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const generatedFileName = `${safeBaseName || "file"}_${uniqueSuffix}${extension}`;

  const absoluteDirectory = MEDIA_DIRECTORIES[resolvedType];
  const absolutePath = path.join(absoluteDirectory, generatedFileName);

  const fileBuffer = decodeBase64Payload(base64Data);
  fs.writeFileSync(absolutePath, fileBuffer);

  const relativePath = path.join("uploads", resolvedType, generatedFileName).replace(/\\/g, "/");

  return {
    mediaType: resolvedType,
    fileName: generatedFileName,
    absolutePath,
    localPath: relativePath,
    localUrl: `/${relativePath}`,
    byteSize: fileBuffer.length,
  };
}

function resolveLocalAbsolutePath(localPath) {
  if (!localPath) {
    throw new Error("localPath is required");
  }

  const normalizedInput = String(localPath).replace(/^\/+/, "");
  const absolutePath = path.resolve(PROJECT_ROOT, normalizedInput);

  if (!absolutePath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid localPath: path must be inside uploads directory");
  }

  return absolutePath;
}

module.exports = {
  UPLOAD_ROOT,
  MEDIA_DIRECTORIES,
  ensureUploadDirectories,
  resolveMediaType,
  saveBase64Media,
  resolveLocalAbsolutePath,
};
