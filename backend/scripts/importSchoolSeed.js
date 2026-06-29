const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const { EJSON } = require("bson");

const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/app";
const dbName = process.env.MONGO_DB_NAME || "app";
const seedPath = path.resolve(process.argv[2] || process.env.SEED_INPUT || path.join(__dirname, "..", "data", "school-seed.ejson"));
const force = ["1", "true", "yes", "on"].includes(String(process.env.SEED_FORCE || "").toLowerCase());

async function hasExistingData(db) {
  const protectedCollections = [
    "superadmins",
    "schooladmins",
    "students",
    "teachers",
    "questions",
    "audioquestions",
    "schools",
  ];

  for (const collectionName of protectedCollections) {
    if ((await db.collection(collectionName).countDocuments({}, { limit: 1 })) > 0) {
      return true;
    }
  }

  return false;
}

async function main() {
  if (!fs.existsSync(seedPath)) {
    console.log(JSON.stringify({ ok: true, imported: false, reason: "seed-not-found", seedPath }, null, 2));
    return;
  }

  const payload = EJSON.parse(fs.readFileSync(seedPath, "utf8"));
  if (!payload || payload.type !== "shiksha-sarthi-school-seed" || !payload.collections) {
    throw new Error(`Invalid ShikshaSarthi seed file: ${seedPath}`);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  try {
    const db = client.db(dbName);
    if (!force && await hasExistingData(db)) {
      console.log(JSON.stringify({ ok: true, imported: false, reason: "database-not-empty", seedPath }, null, 2));
      return;
    }

    const counts = {};
    for (const [collectionName, records] of Object.entries(payload.collections)) {
      const collection = db.collection(collectionName);
      counts[collectionName] = Array.isArray(records) ? records.length : 0;
      if (!counts[collectionName]) continue;

      const operations = records.map((record) => ({
        replaceOne: {
          filter: { _id: record._id },
          replacement: record,
          upsert: true,
        },
      }));
      await collection.bulkWrite(operations, { ordered: false });
    }

    console.log(JSON.stringify({ ok: true, imported: true, seedPath, counts }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
