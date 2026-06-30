const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Cache directory. In the packaged desktop app the backend lives under
// read-only Program Files, so honor AUDIO_CACHE_DIR (set to a writable
// ProgramData location) and only fall back to the local path in dev.
const CACHE_DIR = process.env.AUDIO_CACHE_DIR
  ? path.resolve(process.env.AUDIO_CACHE_DIR)
  : path.join(__dirname, '..', 'data', 'audio-cache');
const FALLBACK_AUDIO_CACHE_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 days
const DEFAULT_AUDIO_CACHE_TTL_MS = Number(process.env.AUDIO_CACHE_TTL_MS || FALLBACK_AUDIO_CACHE_TTL_MS);
const deleteTimers = new Map();

function normalizeTtlMs(ttlMs) {
  const parsed = Number(ttlMs);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return FALLBACK_AUDIO_CACHE_TTL_MS;
}

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log('Audio cache directory created:', CACHE_DIR);
  }
}

// Generate filename from URL
function getFilenameFromUrl(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `${hash}.mp3`;
}

// Get cached file path
function getCachedFilePath(url) {
  const filename = getFilenameFromUrl(url);
  return path.join(CACHE_DIR, filename);
}

function touchFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  try {
    const now = new Date();
    fs.utimesSync(filePath, now, now);
  } catch (error) {
    console.error('Failed to update cache file timestamp:', filePath, error.message);
  }
}

function scheduleDelete(filePath, ttlMs = DEFAULT_AUDIO_CACHE_TTL_MS) {
  if (!filePath) return;
  ensureCacheDir();
  touchFile(filePath);
  const effectiveTtlMs = normalizeTtlMs(ttlMs);

  if (deleteTimers.has(filePath)) {
    clearTimeout(deleteTimers.get(filePath));
  }

  const timer = setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Audio cache expired and deleted:', path.basename(filePath));
      }
    } catch (error) {
      console.error('Failed to delete expired audio cache:', filePath, error.message);
    } finally {
      deleteTimers.delete(filePath);
    }
  }, effectiveTtlMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  deleteTimers.set(filePath, timer);
}

function scheduleDeleteByFilename(filename, ttlMs = DEFAULT_AUDIO_CACHE_TTL_MS) {
  if (!filename) return;
  scheduleDelete(path.join(CACHE_DIR, filename), ttlMs);
}

function scheduleDeleteByUrl(url, ttlMs = DEFAULT_AUDIO_CACHE_TTL_MS) {
  if (!url) return;
  scheduleDelete(getCachedFilePath(url), ttlMs);
}

function deleteExpiredFiles(ttlMs = DEFAULT_AUDIO_CACHE_TTL_MS) {
  ensureCacheDir();
  const effectiveTtlMs = normalizeTtlMs(ttlMs);

  const nowMs = Date.now();
  const files = fs.readdirSync(CACHE_DIR);
  let deleted = 0;

  files.forEach((file) => {
    const filePath = path.join(CACHE_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) return;

      const ageMs = nowMs - stats.mtimeMs;
      if (ageMs > effectiveTtlMs) {
        if (deleteTimers.has(filePath)) {
          clearTimeout(deleteTimers.get(filePath));
          deleteTimers.delete(filePath);
        }
        fs.unlinkSync(filePath);
        deleted++;
      }
    } catch (error) {
      console.error('Failed while checking expired cache file:', filePath, error.message);
    }
  });

  if (deleted > 0) {
    console.log(`Startup cache cleanup deleted ${deleted} expired audio file(s)`);
  }

  return {
    scanned: files.length,
    deleted,
    ttlMs: effectiveTtlMs
  };
}

function initializeCacheCleanup() {
  ensureCacheDir();
  const result = deleteExpiredFiles(DEFAULT_AUDIO_CACHE_TTL_MS);
  console.log(
    `Audio cache startup cleanup -> scanned: ${result.scanned}, deleted: ${result.deleted}, ttlMs: ${result.ttlMs}`
  );
  return result;
}

// Check if file is cached
function isCached(url) {
  const filePath = getCachedFilePath(url);
  return fs.existsSync(filePath);
}

// Download and cache audio file
function downloadAndCache(url) {
  return new Promise((resolve, reject) => {
    ensureCacheDir();
    
    const filePath = getCachedFilePath(url);
    
    // If already cached, return immediately
    if (fs.existsSync(filePath)) {
      console.log('Audio already cached:', getFilenameFromUrl(url));
      scheduleDelete(filePath);
      resolve(filePath);
      return;
    }

    console.log('Downloading audio:', url);
    
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Audio cached successfully:', getFilenameFromUrl(url));
        scheduleDelete(filePath);
        resolve(filePath);
      });

      file.on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
    }).on('error', (err) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

// Batch download multiple audio files
async function batchDownload(urls) {
  const results = {
    success: [],
    failed: []
  };

  for (const url of urls) {
    try {
      const filePath = await downloadAndCache(url);
      results.success.push({
        url,
        cached: true,
        filename: getFilenameFromUrl(url)
      });
    } catch (error) {
      console.error('Failed to cache audio:', url, error.message);
      results.failed.push({
        url,
        error: error.message
      });
    }
  }

  return results;
}

// Get cache statistics
function getCacheStats() {
  ensureCacheDir();
  
  const files = fs.readdirSync(CACHE_DIR);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(CACHE_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });

  return {
    totalFiles: files.length,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    cacheDir: CACHE_DIR
  };
}

// Clear cache
function clearCache() {
  ensureCacheDir();
  
  const files = fs.readdirSync(CACHE_DIR);
  let deleted = 0;
  
  files.forEach(file => {
    const filePath = path.join(CACHE_DIR, file);
    if (deleteTimers.has(filePath)) {
      clearTimeout(deleteTimers.get(filePath));
      deleteTimers.delete(filePath);
    }
    fs.unlinkSync(filePath);
    deleted++;
  });

  return {
    deleted,
    message: `Cleared ${deleted} cached audio files`
  };
}

module.exports = {
  ensureCacheDir,
  getFilenameFromUrl,
  getCachedFilePath,
  touchFile,
  normalizeTtlMs,
  isCached,
  downloadAndCache,
  batchDownload,
  getCacheStats,
  clearCache,
  deleteExpiredFiles,
  initializeCacheCleanup,
  CACHE_DIR,
  FALLBACK_AUDIO_CACHE_TTL_MS,
  DEFAULT_AUDIO_CACHE_TTL_MS,
  scheduleDelete,
  scheduleDeleteByFilename,
  scheduleDeleteByUrl
};
