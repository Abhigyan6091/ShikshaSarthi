const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");
const { pipeline } = require("stream/promises");
const { ensureUploadDirectories, MEDIA_DIRECTORIES } = require("../utils/localMediaStore");
const { SYNC_MODELS } = require("./modelRegistry");

// Honor APP_STATE_DIR (writable ProgramData) when packaged; backend code dir
// is read-only under Program Files.
const DATA_DIR = process.env.APP_STATE_DIR
  ? path.resolve(process.env.APP_STATE_DIR)
  : path.join(__dirname, "..", "data");
const MEDIA_MAP_FILE = path.join(DATA_DIR, "media-map.json");

const MEDIA_DOWNLOAD_TIMEOUT_MS = Number(process.env.SYNC_MEDIA_TIMEOUT_MS || 300_000);
const MEDIA_SCAN_LIMIT_PER_COLLECTION = Number(process.env.SYNC_MEDIA_SCAN_LIMIT_PER_COLLECTION || 0);
const MEDIA_DOWNLOAD_RETRY_COUNT = Number(process.env.SYNC_MEDIA_RETRY_COUNT || 2);
const MEDIA_FAILURE_LOG_COOLDOWN_MS = Number(
  process.env.SYNC_MEDIA_FAILURE_LOG_COOLDOWN_MS || 10 * 60_000
);
const mediaFailureLogTimestamps = new Map();

const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/aac": ".aac",
  "audio/x-m4a": ".m4a",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readMediaMap() {
  try {
    if (!fs.existsSync(MEDIA_MAP_FILE)) {
      return { byLocalUrl: {}, byCloudUrl: {} };
    }

    const parsed = JSON.parse(fs.readFileSync(MEDIA_MAP_FILE, "utf8"));
    if (!isPlainObject(parsed) || !isPlainObject(parsed.byLocalUrl)) {
      return { byLocalUrl: {}, byCloudUrl: {} };
    }

    return {
      byLocalUrl: parsed.byLocalUrl || {},
      byCloudUrl: isPlainObject(parsed.byCloudUrl) ? parsed.byCloudUrl : {},
    };
  } catch (_error) {
    return { byLocalUrl: {}, byCloudUrl: {} };
  }
}

function writeMediaMap(mapData) {
  try {
    ensureDataDir();
    fs.writeFileSync(
      MEDIA_MAP_FILE,
      JSON.stringify(
        {
          version: 1,
          updatedAt: new Date().toISOString(),
          byLocalUrl: mapData.byLocalUrl || {},
          byCloudUrl: mapData.byCloudUrl || {},
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Failed to write media map:", error.message);
  }
}

function getBackendBaseUrl() {
  const explicit = String(process.env.LOCAL_MEDIA_BASE_URL || "").trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function buildPublicUrls(relativePath) {
  const normalizedRelativePath = String(relativePath || "").replace(/^\/+/, "");
  const relativeUrl = `/${normalizedRelativePath}`;
  const absoluteUrl = `${getBackendBaseUrl()}${relativeUrl}`;

  return {
    relativeUrl,
    relativePathNoSlash: normalizedRelativePath,
    absoluteUrl,
  };
}

function normalizeLocalMediaKey(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname && parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function getCloudUrlFromMap(rawValue, mediaMap) {
  if (!rawValue || typeof rawValue !== "string") {
    return null;
  }

  const byLocalUrl = mediaMap.byLocalUrl || {};
  if (byLocalUrl[rawValue]) {
    return byLocalUrl[rawValue];
  }

  const normalizedKey = normalizeLocalMediaKey(rawValue);
  if (!normalizedKey) {
    return null;
  }

  if (byLocalUrl[normalizedKey]) {
    return byLocalUrl[normalizedKey];
  }

  const noSlash = normalizedKey.replace(/^\//, "");
  if (byLocalUrl[noSlash]) {
    return byLocalUrl[noSlash];
  }

  return null;
}

function deepMapValues(value, transformFn) {
  if (Array.isArray(value)) {
    return value.map((item) => deepMapValues(item, transformFn));
  }

  if (isPlainObject(value)) {
    const output = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      output[key] = deepMapValues(nestedValue, transformFn);
    });
    return output;
  }

  return transformFn(value);
}

function restoreCloudUrlsForUpload(record, mediaMapInput) {
  if (!record) {
    return record;
  }

  const mediaMap = mediaMapInput || readMediaMap();
  return deepMapValues(record, (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return getCloudUrlFromMap(value, mediaMap) || value;
  });
}

function isCloudinaryUrl(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  if (!/^https?:\/\//i.test(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase().includes("res.cloudinary.com");
  } catch (_error) {
    return false;
  }
}

function extractCloudinaryUrls(rawValue) {
  if (typeof rawValue !== "string") {
    return [];
  }

  const input = rawValue.trim();
  if (!input) {
    return [];
  }

  const matches = input.match(/https?:\/\/res\.cloudinary\.com\/.*?(?=https?:\/\/res\.cloudinary\.com\/|$)/gi);
  if (!Array.isArray(matches) || !matches.length) {
    return [];
  }

  const sanitized = matches
    .map((candidate) => String(candidate).trim().replace(/["'`)\],;]+$/g, ""))
    .filter((candidate) => isCloudinaryUrl(candidate));

  return [...new Set(sanitized)];
}

function isTransientDownloadError(error) {
  const message = String(error && error.message ? error.message : "");
  return /(EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT|socket hang up|network timeout|aborted)/i.test(message);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
  const retryCount = Math.max(0, MEDIA_DOWNLOAD_RETRY_COUNT);
  let attempt = 0;
  let lastError = null;

  while (attempt <= retryCount) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (attempt >= retryCount || !isTransientDownloadError(error)) {
        throw error;
      }

      const backoffMs = 400 * (attempt + 1);
      await wait(backoffMs);
      attempt += 1;
    }
  }

  throw lastError || new Error("Unknown media download error");
}

function shouldLogDownloadFailure(collectionName, url, error) {
  if (MEDIA_FAILURE_LOG_COOLDOWN_MS <= 0) {
    return true;
  }

  const message = String(error && error.message ? error.message : "unknown");
  const key = `${collectionName}|${url}|${message}`;
  const now = Date.now();
  const lastSeen = mediaFailureLogTimestamps.get(key) || 0;

  if (now - lastSeen < MEDIA_FAILURE_LOG_COOLDOWN_MS) {
    return false;
  }

  mediaFailureLogTimestamps.set(key, now);
  return true;
}

function looksLikeAudioByExtension(filePath = "") {
  return /\.(mp3|wav|ogg|aac|m4a)$/i.test(filePath);
}

function inferMediaTypeFromUrlAndMime(url, mimeType = "") {
  const normalizedMime = String(mimeType || "").toLowerCase();
  if (normalizedMime.startsWith("image/")) return "images";
  if (normalizedMime.startsWith("audio/")) return "audios";
  if (normalizedMime.startsWith("video/")) return "videos";

  const normalizedUrl = String(url || "").toLowerCase();
  if (normalizedUrl.includes("/image/upload/")) return "images";
  if (normalizedUrl.includes("/video/upload/")) {
    return looksLikeAudioByExtension(normalizedUrl) ? "audios" : "videos";
  }
  if (looksLikeAudioByExtension(normalizedUrl)) return "audios";

  return "images";
}

function resolveExtension(url, mimeType, mediaType) {
  const cleanMimeType = String(mimeType || "").toLowerCase().split(";")[0].trim();
  if (MIME_EXTENSION_MAP[cleanMimeType]) {
    return MIME_EXTENSION_MAP[cleanMimeType];
  }

  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname || "").toLowerCase();
    if (ext) {
      return ext;
    }
  } catch (_error) {
    // ignore
  }

  if (mediaType === "videos") return ".mp4";
  if (mediaType === "audios") return ".mp3";
  return ".jpg";
}

function hashUrl(url) {
  return crypto.createHash("sha1").update(String(url)).digest("hex").slice(0, 24);
}

async function downloadCloudinaryToLocal(url, mediaMap, inMemoryCache) {
  if (inMemoryCache[url]) {
    return inMemoryCache[url];
  }

  ensureUploadDirectories();

  const existingCloudEntry = mediaMap.byCloudUrl && mediaMap.byCloudUrl[url];
  if (isPlainObject(existingCloudEntry) && existingCloudEntry.relativePath) {
    const absoluteExistingPath = path.join(
      path.join(__dirname, "..", ".."),
      existingCloudEntry.relativePath
    );

    if (fs.existsSync(absoluteExistingPath)) {
      const localUrls = buildPublicUrls(existingCloudEntry.relativePath);
      const cachedResult = {
        url,
        mediaType: existingCloudEntry.mediaType || "images",
        relativePath: existingCloudEntry.relativePath,
        relativeUrl: localUrls.relativeUrl,
        localUrl: localUrls.absoluteUrl,
        downloaded: 0,
      };

      inMemoryCache[url] = cachedResult;
      return cachedResult;
    }
  }

  // Fast path: infer destination from URL and skip network if file already exists.
  const guessedMediaType = inferMediaTypeFromUrlAndMime(url, "");
  const guessedExtension = resolveExtension(url, "", guessedMediaType);
  const guessedFileName = `cloud_${hashUrl(url)}${guessedExtension}`;
  const guessedAbsolutePath = path.join(MEDIA_DIRECTORIES[guessedMediaType], guessedFileName);

  if (fs.existsSync(guessedAbsolutePath)) {
    const guessedRelativePath = path.join("uploads", guessedMediaType, guessedFileName).replace(/\\/g, "/");
    const guessedUrls = buildPublicUrls(guessedRelativePath);
    const cachedResult = {
      url,
      mediaType: guessedMediaType,
      relativePath: guessedRelativePath,
      relativeUrl: guessedUrls.relativeUrl,
      localUrl: guessedUrls.absoluteUrl,
      downloaded: 0,
    };

    mediaMap.byLocalUrl[guessedUrls.relativeUrl] = url;
    mediaMap.byLocalUrl[guessedUrls.absoluteUrl] = url;
    mediaMap.byLocalUrl[guessedUrls.relativePathNoSlash] = url;
    mediaMap.byCloudUrl[url] = {
      mediaType: guessedMediaType,
      relativePath: guessedRelativePath,
      relativeUrl: guessedUrls.relativeUrl,
      localUrl: guessedUrls.absoluteUrl,
    };
    inMemoryCache[url] = cachedResult;
    return cachedResult;
  }

  const response = await fetchWithRetry(url, { timeout: MEDIA_DOWNLOAD_TIMEOUT_MS });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const mimeType = response.headers.get("content-type") || "";
  const mediaType = inferMediaTypeFromUrlAndMime(url, mimeType);
  const extension = resolveExtension(url, mimeType, mediaType);
  const fileName = `cloud_${hashUrl(url)}${extension}`;
  const absolutePath = path.join(MEDIA_DIRECTORIES[mediaType], fileName);
  const existedBefore = fs.existsSync(absolutePath);

  if (!existedBefore) {
    const tempPath = `${absolutePath}.part`;
    try {
      const writeStream = fs.createWriteStream(tempPath);
      await pipeline(response.body, writeStream);
      fs.renameSync(tempPath, absolutePath);
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw error;
    }
  } else if (response.body && typeof response.body.resume === "function") {
    response.body.resume();
  }

  const relativePath = path.join("uploads", mediaType, fileName).replace(/\\/g, "/");
  const localUrls = buildPublicUrls(relativePath);
  const result = {
    url,
    mediaType,
    relativePath,
    relativeUrl: localUrls.relativeUrl,
    localUrl: localUrls.absoluteUrl,
    downloaded: existedBefore ? 0 : 1,
  };

  mediaMap.byLocalUrl[localUrls.relativeUrl] = url;
  mediaMap.byLocalUrl[localUrls.absoluteUrl] = url;
  mediaMap.byLocalUrl[localUrls.relativePathNoSlash] = url;
  mediaMap.byCloudUrl[url] = {
    mediaType,
    relativePath,
    relativeUrl: localUrls.relativeUrl,
    localUrl: localUrls.absoluteUrl,
  };
  inMemoryCache[url] = result;

  return result;
}

function collectCloudinaryFields(value, currentPath = [], output = []) {
  if (typeof value === "string") {
    const urls = extractCloudinaryUrls(value);
    if (urls.length) {
      output.push({
        path: currentPath.join("."),
        urls,
      });
    }
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectCloudinaryFields(entry, [...currentPath, String(index)], output);
    });
    return output;
  }

  if (!isPlainObject(value)) {
    return output;
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (key === "cloudUrl") {
      return;
    }
    collectCloudinaryFields(nestedValue, [...currentPath, key], output);
  });

  return output;
}

async function syncCloudMediaToLocal(options = {}) {
  const selectedCollections = Array.isArray(options.collections)
    ? options.collections.filter((name) => Boolean(SYNC_MODELS[name]))
    : Object.keys(SYNC_MODELS);

  const mediaMap = readMediaMap();
  const inMemoryCache = {};

  const summary = {
    scannedRecords: 0,
    updatedRecords: 0,
    foundUrls: 0,
    downloadedFiles: 0,
    failedUrls: 0,
    collections: {},
  };

  let mediaMapChanged = false;

  for (const collectionName of selectedCollections) {
    const model = SYNC_MODELS[collectionName];
    if (!model) {
      continue;
    }

    let query = model.find({}).setOptions({ includeDeleted: true }).lean();
    if (MEDIA_SCAN_LIMIT_PER_COLLECTION > 0) {
      query = query.limit(MEDIA_SCAN_LIMIT_PER_COLLECTION);
    }

    const docs = await query;
    summary.scannedRecords += docs.length;
    summary.collections[collectionName] = {
      scannedRecords: docs.length,
      updatedRecords: 0,
      foundUrls: 0,
      downloadedFiles: 0,
      failedUrls: 0,
    };

    for (const doc of docs) {
      const cloudFields = collectCloudinaryFields(doc);
      if (!cloudFields.length) {
        continue;
      }

      summary.foundUrls += cloudFields.length;
      summary.collections[collectionName].foundUrls += cloudFields.length;

      const setPayload = {};
      let primaryMedia = null;

      for (const field of cloudFields) {
        let localized = null;
        let selectedUrl = null;
        let lastError = null;

        const candidateUrls = Array.isArray(field.urls) && field.urls.length ? field.urls : [];

        try {
          for (const candidateUrl of candidateUrls) {
            try {
              const beforeLocalKeys = Object.keys(mediaMap.byLocalUrl || {}).length;
              const beforeCloudKeys = Object.keys(mediaMap.byCloudUrl || {}).length;
              const attemptLocalized = await downloadCloudinaryToLocal(
                candidateUrl,
                mediaMap,
                inMemoryCache
              );
              const afterLocalKeys = Object.keys(mediaMap.byLocalUrl || {}).length;
              const afterCloudKeys = Object.keys(mediaMap.byCloudUrl || {}).length;

              if (afterLocalKeys !== beforeLocalKeys || afterCloudKeys !== beforeCloudKeys) {
                mediaMapChanged = true;
              }

              localized = attemptLocalized;
              selectedUrl = candidateUrl;
              break;
            } catch (candidateError) {
              lastError = candidateError;
            }
          }

          if (!localized) {
            throw lastError || new Error("No valid Cloudinary URL candidate resolved");
          }

          setPayload[field.path] = localized.localUrl;
          summary.downloadedFiles += localized.downloaded || 0;
          summary.collections[collectionName].downloadedFiles += localized.downloaded || 0;

          if (!primaryMedia && !field.path.startsWith("hint.")) {
            primaryMedia = {
              cloudUrl: selectedUrl,
              relativePath: localized.relativePath,
            };
          }
        } catch (error) {
          summary.failedUrls += 1;
          summary.collections[collectionName].failedUrls += 1;
          const debugUrl = candidateUrls.join(" | ");
          if (shouldLogDownloadFailure(collectionName, debugUrl, error)) {
            console.error(`Media sync download failed [${collectionName}] ${debugUrl}:`, error.message);
          }
        }
      }

      if (!Object.keys(setPayload).length) {
        continue;
      }

      if (primaryMedia) {
        if (doc.localPath !== primaryMedia.relativePath) {
          setPayload.localPath = primaryMedia.relativePath;
        }
        if (!doc.cloudUrl) {
          setPayload.cloudUrl = primaryMedia.cloudUrl;
        }
      }

      await model.updateOne(
        { _id: doc._id },
        { $set: setPayload },
        {
          runValidators: false,
          includeDeleted: true,
          skipSyncMetadata: true,
        }
      );

      summary.updatedRecords += 1;
      summary.collections[collectionName].updatedRecords += 1;
    }
  }

  if (mediaMapChanged) {
    writeMediaMap(mediaMap);
  }

  return summary;
}

async function ensureCloudUrlLocalized(url) {
  if (!isCloudinaryUrl(url)) {
    return null;
  }

  const mediaMap = readMediaMap();
  const inMemoryCache = {};
  const fileAlreadyExisted = fs.existsSync(MEDIA_MAP_FILE);
  const beforeLocalKeys = Object.keys(mediaMap.byLocalUrl || {}).length;
  const beforeCloudKeys = Object.keys(mediaMap.byCloudUrl || {}).length;

  const localized = await downloadCloudinaryToLocal(url, mediaMap, inMemoryCache);

  const afterLocalKeys = Object.keys(mediaMap.byLocalUrl || {}).length;
  const afterCloudKeys = Object.keys(mediaMap.byCloudUrl || {}).length;
  if (!fileAlreadyExisted || afterLocalKeys !== beforeLocalKeys || afterCloudKeys !== beforeCloudKeys) {
    writeMediaMap(mediaMap);
  }

  return localized;
}

module.exports = {
  syncCloudMediaToLocal,
  restoreCloudUrlsForUpload,
  getMediaMapSnapshot: readMediaMap,
  ensureCloudUrlLocalized,
};
