#!/usr/bin/env node
require("dotenv").config();

const mongoose = require("mongoose");
const { restoreBackup } = require("../utils/backupService");
const { getMongoUri } = require("../config/appConfig");

async function main() {
  const backupPath = process.argv[2];
  if (!backupPath) {
    throw new Error("Usage: node scripts/restoreMongo.js <backup-path>");
  }

  const { mongoUri } = getMongoUri();
  await mongoose.connect(mongoUri);
  const result = await restoreBackup(backupPath);
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Restore failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch (_error) {
    // ignore disconnect errors during failure handling
  }
  process.exit(1);
});
