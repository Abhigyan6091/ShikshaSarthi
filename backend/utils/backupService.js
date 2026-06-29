const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { MongoClient } = require("mongodb");
const { EJSON } = require("bson");
const { appConfig, getMongoUri } = require("../config/appConfig");
const { UPLOAD_ROOT } = require("./localMediaStore");

function ensureBackupDir() {
  fs.mkdirSync(appConfig.backupDir, { recursive: true });
}

function timestampForFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function getDirectorySize(targetPath) {
  if (!fs.existsSync(targetPath)) return 0;

  const stats = fs.statSync(targetPath);
  if (stats.isFile()) return stats.size;

  return fs.readdirSync(targetPath).reduce((total, entry) => {
    return total + getDirectorySize(path.join(targetPath, entry));
  }, 0);
}

function calculateSha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function listFiles(targetPath, rootPath = targetPath) {
  if (!fs.existsSync(targetPath)) return [];

  return fs.readdirSync(targetPath).flatMap((entry) => {
    const absolutePath = path.join(targetPath, entry);
    const stats = fs.statSync(absolutePath);

    if (stats.isDirectory()) {
      return listFiles(absolutePath, rootPath);
    }

    return [{
      path: path.relative(rootPath, absolutePath).replace(/\\/g, "/"),
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    }];
  });
}

async function createJsonDatabaseDump(outputDir) {
  const { mongoUri } = getMongoUri();
  const client = new MongoClient(mongoUri);
  const dbDumpDir = path.join(outputDir, "db-json");
  fs.mkdirSync(dbDumpDir, { recursive: true });

  try {
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const manifest = [];

    for (const collection of collections) {
      const docs = await db.collection(collection.name).find({}).toArray();
      fs.writeFileSync(path.join(dbDumpDir, `${collection.name}.json`), EJSON.stringify(docs, null, 2));
      manifest.push({ collection: collection.name, count: docs.length });
    }

    fs.writeFileSync(
      path.join(dbDumpDir, "manifest.json"),
      JSON.stringify({ database: db.databaseName, collections: manifest }, null, 2)
    );

    return { method: "json", database: db.databaseName, collections: manifest };
  } finally {
    await client.close();
  }
}

function tryMongoDump(outputDir) {
  const { mongoUri } = getMongoUri();
  const dumpDir = path.join(outputDir, "mongodump");
  const result = spawnSync("mongodump", ["--uri", mongoUri, "--out", dumpDir], {
    encoding: "utf8",
  });

  if (result.error && result.error.code === "ENOENT") {
    return { ok: false, unavailable: true, error: "mongodump is not installed" };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      unavailable: false,
      error: result.stderr || result.stdout || "mongodump failed",
    };
  }

  return { ok: true, method: "mongodump", dumpDir };
}

function copyUploads(outputDir) {
  const uploadsDir = path.join(outputDir, "uploads");
  const metadataPath = path.join(outputDir, "uploads-metadata.json");
  const files = listFiles(UPLOAD_ROOT);

  fs.writeFileSync(
    metadataPath,
    JSON.stringify({ uploadsPath: UPLOAD_ROOT, copied: fs.existsSync(UPLOAD_ROOT), files }, null, 2)
  );

  if (fs.existsSync(UPLOAD_ROOT)) {
    fs.cpSync(UPLOAD_ROOT, uploadsDir, { recursive: true });
  }

  return { uploadsDir, files: files.length };
}

async function createBackup() {
  if (!appConfig.backupEnabled) {
    throw new Error("Backups are disabled by BACKUP_ENABLED=false");
  }

  ensureBackupDir();
  const createdAt = new Date();
  const filename = `shikshasarthi-backup-${timestampForFilename(createdAt)}`;
  const backupPath = path.join(appConfig.backupDir, filename);
  fs.mkdirSync(backupPath, { recursive: true });

  const mongoDumpResult = tryMongoDump(backupPath);
  const database = mongoDumpResult.ok
    ? mongoDumpResult
    : await createJsonDatabaseDump(backupPath);
  const uploads = copyUploads(backupPath);

  const metadata = {
    filename,
    path: backupPath,
    createdAt: createdAt.toISOString(),
    schoolId: appConfig.aws.schoolId,
    appVersion: appConfig.version,
    app: {
      mode: appConfig.mode,
      version: appConfig.version,
      nodeRole: appConfig.nodeRole,
    },
    database,
    mongodump: mongoDumpResult,
    uploads,
  };

  metadata.size = getDirectorySize(backupPath);
  fs.writeFileSync(path.join(backupPath, "backup-metadata.json"), JSON.stringify(metadata, null, 2));

  const packageInfo = packageBackupDirectory(backupPath, metadata);
  const enrichedMetadata = {
    ...metadata,
    package: packageInfo,
    sha256: packageInfo.sha256,
    includesUploads: uploads.files > 0,
  };
  fs.writeFileSync(path.join(backupPath, "backup-metadata.json"), JSON.stringify(enrichedMetadata, null, 2));

  return enrichedMetadata;
}

function packageBackupDirectory(backupPath, metadata) {
  const packagePath = `${backupPath}.tar.gz`;
  const packageFile = path.basename(packagePath);
  const metadataForPackage = {
    schoolId: appConfig.aws.schoolId,
    appVersion: appConfig.version,
    createdAt: metadata.createdAt,
    database: metadata.database?.database || "app",
    includesUploads: metadata.uploads?.files > 0,
    sha256: null,
  };

  fs.writeFileSync(
    path.join(backupPath, "backup-metadata.json"),
    JSON.stringify({ ...metadata, backupPackage: packageFile, packageSha256: null }, null, 2)
  );

  const result = spawnSync("tar", ["-czf", packagePath, "-C", path.dirname(backupPath), path.basename(backupPath)], {
    encoding: "utf8",
  });

  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.stdout || result.error?.message || "Backup packaging failed");
  }

  const sha256 = calculateSha256(packagePath);
  metadataForPackage.sha256 = sha256;

  return {
    path: packagePath,
    fileName: packageFile,
    contentType: "application/gzip",
    size: fs.statSync(packagePath).size,
    sha256,
    metadata: metadataForPackage,
  };
}

function getLatestBackup() {
  const latest = listBackups()[0] || null;
  if (!latest) return null;

  const metadataPath = path.join(latest.path, "backup-metadata.json");
  let metadata = latest;
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  }

  const packagePath = metadata.package?.path || `${latest.path}.tar.gz`;
  return {
    ...metadata,
    package: fs.existsSync(packagePath)
      ? {
          ...(metadata.package || {}),
          path: packagePath,
          fileName: path.basename(packagePath),
          contentType: metadata.package?.contentType || "application/gzip",
          size: fs.statSync(packagePath).size,
          sha256: metadata.package?.sha256 || calculateSha256(packagePath),
        }
      : metadata.package || null,
  };
}

async function ensureLatestBackupPackage() {
  const latest = getLatestBackup();
  if (!latest) {
    return createBackup();
  }

  if (latest.package?.path && fs.existsSync(latest.package.path)) {
    return latest;
  }

  const packageInfo = packageBackupDirectory(latest.path, latest);
  const enriched = { ...latest, package: packageInfo, sha256: packageInfo.sha256 };
  fs.writeFileSync(path.join(latest.path, "backup-metadata.json"), JSON.stringify(enriched, null, 2));
  return enriched;
}

async function createBackupPackage() {
  return createBackup();
}

function latestBackupResponse() {
  const latest = getLatestBackup();
  if (!latest) return null;

  return {
    filename: latest.filename,
    path: latest.path,
    createdAt: latest.createdAt,
    schoolId: latest.schoolId || appConfig.aws.schoolId,
    appVersion: latest.appVersion || latest.app?.version || appConfig.version,
    database: latest.database?.database || latest.database?.name || "app",
    includesUploads: Boolean(latest.includesUploads || latest.uploads?.files),
    sha256: latest.sha256 || latest.package?.sha256 || null,
    package: latest.package || null,
  };
}

function listBackups() {
  ensureBackupDir();

  return fs.readdirSync(appConfig.backupDir)
    .map((filename) => {
      const backupPath = path.join(appConfig.backupDir, filename);
      const stats = fs.statSync(backupPath);
      if (!stats.isDirectory()) return null;

      let metadata = {};
      const metadataPath = path.join(backupPath, "backup-metadata.json");
      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        } catch (_error) {
          metadata = {};
        }
      }

      return {
        filename,
        path: backupPath,
        size: getDirectorySize(backupPath),
        createdAt: metadata.createdAt || stats.birthtime.toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function restoreJsonDatabaseDump(backupPath) {
  const dbJsonDir = path.join(backupPath, "db-json");
  if (!fs.existsSync(dbJsonDir)) {
    throw new Error("JSON database dump not found in backup");
  }

  const { mongoUri } = getMongoUri();
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();
    const files = fs.readdirSync(dbJsonDir).filter((file) => file.endsWith(".json") && file !== "manifest.json");

    for (const file of files) {
      const collectionName = path.basename(file, ".json");
      const docs = EJSON.parse(fs.readFileSync(path.join(dbJsonDir, file), "utf8"));
      await db.collection(collectionName).deleteMany({});
      if (docs.length > 0) {
        await db.collection(collectionName).insertMany(docs);
      }
    }

    return { restoredCollections: files.map((file) => path.basename(file, ".json")) };
  } finally {
    await client.close();
  }
}

async function restoreBackup(backupPath) {
  const absoluteBackupPath = path.resolve(backupPath);
  if (!absoluteBackupPath.startsWith(appConfig.backupDir) || !fs.existsSync(absoluteBackupPath)) {
    throw new Error("Backup path is invalid or does not exist");
  }

  const mongoDumpDir = path.join(absoluteBackupPath, "mongodump");
  if (fs.existsSync(mongoDumpDir)) {
    const { mongoUri } = getMongoUri();
    const result = spawnSync("mongorestore", ["--uri", mongoUri, "--drop", mongoDumpDir], {
      encoding: "utf8",
    });

    if (!result.error && result.status === 0) {
      return { method: "mongorestore" };
    }
  }

  return { method: "json", ...(await restoreJsonDatabaseDump(absoluteBackupPath)) };
}

module.exports = {
  createBackup,
  createBackupPackage,
  ensureLatestBackupPackage,
  getLatestBackup,
  latestBackupResponse,
  calculateSha256,
  listBackups,
  restoreBackup,
};
