#!/usr/bin/env node
require("dotenv").config();

const mongoose = require("mongoose");
const { createBackup } = require("../utils/backupService");
const { getMongoUri } = require("../config/appConfig");

async function main() {
  const { mongoUri } = getMongoUri();
  await mongoose.connect(mongoUri);
  const backup = await createBackup();
  console.log(JSON.stringify({
    filename: backup.filename,
    path: backup.path,
    size: backup.size,
    createdAt: backup.createdAt,
  }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Backup failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch (_error) {
    // ignore disconnect errors during failure handling
  }
  process.exit(1);
});
