const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const { EJSON } = require("bson");

const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/app";
const dbName = process.env.MONGO_DB_NAME || "app";
const outputPath = path.resolve(process.argv[2] || process.env.SEED_OUTPUT || path.join(__dirname, "..", "data", "school-seed.ejson"));

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  try {
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const payload = {
      type: "shiksha-sarthi-school-seed",
      dbName,
      createdAt: new Date().toISOString(),
      collections: {},
    };

    for (const collection of collections) {
      const name = collection.name;
      if (name.startsWith("system.")) continue;
      payload.collections[name] = await db.collection(name).find({}).toArray();
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, EJSON.stringify(payload, null, 2));

    const counts = Object.fromEntries(
      Object.entries(payload.collections).map(([name, records]) => [name, records.length])
    );
    console.log(JSON.stringify({ ok: true, outputPath, counts }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
