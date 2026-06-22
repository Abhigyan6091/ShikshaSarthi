const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const SchoolAdmin = require("../models/SchoolAdmin");
const SuperAdmin = require("../models/SuperAdmin");

const REMOTE_TIMEOUT_MS = Number(process.env.SYNC_REMOTE_TIMEOUT_MS || 10_000);
const AUTH_HASH_REPAIR_ENABLED =
  String(process.env.SYNC_AUTH_HASH_REPAIR_ENABLED || "true").toLowerCase() !== "false";

const AUTH_MODELS = [
  { key: "students", model: Student },
  { key: "teachers", model: Teacher },
  { key: "schoolAdmins", model: SchoolAdmin },
  { key: "superAdmins", model: SuperAdmin },
];

function isLikelyBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

/**
 * If local credentials were corrupted during old sync runs, verify against Atlas
 * and repair local hashed password in-place.
 * Only repairs if the remote record is newer than or equal to the local record,
 * so intentionally changed passwords are not reverted.
 */
async function repairLocalPasswordFromAtlas({
  model,
  lookupQuery,
  candidatePassword,
}) {
  const sourceUri = String(process.env.MONGO_URI || "").trim();
  const sourceDbName = String(process.env.SYNC_SOURCE_DB_NAME || "test").trim();

  if (!sourceUri || !model || !lookupQuery || !candidatePassword) {
    return false;
  }

  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });

  try {
    await client.connect();

    const sourceDb = client.db(sourceDbName);
    const sourceCollection = sourceDb.collection(model.collection.name);
    const remoteUser = await sourceCollection.findOne(lookupQuery, {
      projection: { password: 1, updatedAt: 1 },
    });

    if (!remoteUser || typeof remoteUser.password !== "string") {
      return false;
    }

    const passwordMatches = await bcrypt.compare(candidatePassword, remoteUser.password);
    if (!passwordMatches) {
      return false;
    }

    // Only repair if remote is not older than local
    const localUser = await model
      .findOne(lookupQuery)
      .setOptions({ includeDeleted: true })
      .select({ updatedAt: 1 })
      .lean();

    const remoteUpdatedAt = remoteUser.updatedAt ? new Date(remoteUser.updatedAt).getTime() : 0;
    const localUpdatedAt = localUser?.updatedAt ? new Date(localUser.updatedAt).getTime() : 0;

    if (localUpdatedAt > remoteUpdatedAt) {
      return false;
    }

    // Preserve the more recent updatedAt
    const resolvedUpdatedAt = remoteUpdatedAt >= localUpdatedAt
      ? (remoteUser.updatedAt || new Date())
      : (localUser.updatedAt || new Date());

    const writeResult = await model.updateOne(
      lookupQuery,
      {
        $set: {
          password: remoteUser.password,
          synced: true,
          updatedAt: resolvedUpdatedAt,
        },
      },
      {
        runValidators: false,
        includeDeleted: true,
        skipSyncMetadata: true,
      }
    );

    return Boolean(writeResult.matchedCount);
  } catch (_error) {
    return false;
  } finally {
    await client.close().catch(() => {});
  }
}

async function repairAuthCollectionHashes({ sourceDb, model, key }) {
  const summary = {
    key,
    scannedRemote: 0,
    repaired: 0,
    skippedMissingLocal: 0,
    skippedAlreadyEqual: 0,
    skippedInvalidRemoteHash: 0,
    skippedLocalNewer: 0,
    failed: 0,
  };

  const localRows = await model
    .find({})
    .setOptions({ includeDeleted: true })
    .select({ _id: 1, password: 1, updatedAt: 1 })
    .lean();

  const localDataById = new Map(
    localRows.map((doc) => [
      String(doc._id),
      {
        password: typeof doc.password === "string" ? doc.password : "",
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0,
      },
    ])
  );

  const collection = sourceDb.collection(model.collection.name);
  const cursor = collection.find(
    { password: { $exists: true } },
    { projection: { _id: 1, password: 1, updatedAt: 1 } }
  );

  const pendingOps = [];

  for await (const remoteDoc of cursor) {
    summary.scannedRemote += 1;

    const remoteHash = typeof remoteDoc.password === "string" ? remoteDoc.password : "";
    if (!isLikelyBcryptHash(remoteHash)) {
      summary.skippedInvalidRemoteHash += 1;
      continue;
    }

    const idKey = String(remoteDoc._id);
    if (!localDataById.has(idKey)) {
      summary.skippedMissingLocal += 1;
      continue;
    }

    const localData = localDataById.get(idKey);
    const localHash = localData.password;

    if (localHash === remoteHash) {
      summary.skippedAlreadyEqual += 1;
      continue;
    }

    // Skip if local record is newer (password was changed locally)
    const remoteUpdatedAt = remoteDoc.updatedAt ? new Date(remoteDoc.updatedAt).getTime() : 0;
    if (localData.updatedAt > remoteUpdatedAt) {
      summary.skippedLocalNewer += 1;
      continue;
    }

    // Preserve the more recent updatedAt
    const resolvedUpdatedAt = remoteUpdatedAt >= localData.updatedAt
      ? (remoteDoc.updatedAt || new Date())
      : (localData.updatedAt ? new Date(localData.updatedAt) : new Date());

    pendingOps.push({
      updateOne: {
        filter: { _id: remoteDoc._id },
        update: {
          $set: {
            password: remoteHash,
            synced: true,
            updatedAt: resolvedUpdatedAt,
          },
        },
        upsert: false,
      },
    });

    // Keep memory and single-request size bounded.
    if (pendingOps.length >= 200) {
      try {
        await model.bulkWrite(pendingOps, { ordered: false });
        summary.repaired += pendingOps.length;
      } catch (_error) {
        summary.failed += pendingOps.length;
      } finally {
        pendingOps.length = 0;
      }
    }
  }

  if (pendingOps.length) {
    try {
      await model.bulkWrite(pendingOps, { ordered: false });
      summary.repaired += pendingOps.length;
    } catch (_error) {
      summary.failed += pendingOps.length;
    }
  }

  return summary;
}

async function repairAllLocalAuthPasswordsFromAtlas() {
  const sourceUri = String(process.env.MONGO_URI || "").trim();
  const sourceDbName = String(process.env.SYNC_SOURCE_DB_NAME || "test").trim();

  if (!AUTH_HASH_REPAIR_ENABLED) {
    return {
      attempted: false,
      skipped: true,
      reason: "disabled-by-env",
    };
  }

  if (!sourceUri) {
    return {
      attempted: false,
      skipped: true,
      reason: "source-uri-not-configured",
    };
  }

  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });
  const startedAt = Date.now();

  const result = {
    attempted: true,
    repaired: 0,
    scannedRemote: 0,
    skippedMissingLocal: 0,
    skippedAlreadyEqual: 0,
    skippedInvalidRemoteHash: 0,
    skippedLocalNewer: 0,
    failed: 0,
    collections: {},
    durationMs: 0,
  };

  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);

    for (const entry of AUTH_MODELS) {
      const entrySummary = await repairAuthCollectionHashes({
        sourceDb,
        model: entry.model,
        key: entry.key,
      });

      result.collections[entry.key] = entrySummary;
      result.repaired += entrySummary.repaired;
      result.scannedRemote += entrySummary.scannedRemote;
      result.skippedMissingLocal += entrySummary.skippedMissingLocal;
      result.skippedAlreadyEqual += entrySummary.skippedAlreadyEqual;
      result.skippedInvalidRemoteHash += entrySummary.skippedInvalidRemoteHash;
      result.skippedLocalNewer += entrySummary.skippedLocalNewer;
      result.failed += entrySummary.failed;
    }

    result.durationMs = Date.now() - startedAt;
    return result;
  } catch (error) {
    return {
      attempted: true,
      error: error.message,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    await client.close().catch(() => {});
  }
}

module.exports = {
  repairLocalPasswordFromAtlas,
  repairAllLocalAuthPasswordsFromAtlas,
};
