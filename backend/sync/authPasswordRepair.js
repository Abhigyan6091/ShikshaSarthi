const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

const REMOTE_TIMEOUT_MS = Number(process.env.SYNC_REMOTE_TIMEOUT_MS || 10_000);

/**
 * If local credentials were corrupted during old sync runs, verify against Atlas
 * and repair local hashed password in-place.
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
      projection: { password: 1 },
    });

    if (!remoteUser || typeof remoteUser.password !== "string") {
      return false;
    }

    const passwordMatches = await bcrypt.compare(candidatePassword, remoteUser.password);
    if (!passwordMatches) {
      return false;
    }

    const writeResult = await model.updateOne(
      lookupQuery,
      {
        $set: {
          password: remoteUser.password,
          synced: true,
          updatedAt: new Date(),
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

module.exports = {
  repairLocalPasswordFromAtlas,
};
