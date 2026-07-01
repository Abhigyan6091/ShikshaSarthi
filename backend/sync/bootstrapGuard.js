const { runAutoSyncCycle } = require("./autoSyncService");
const { appConfig } = require("../config/appConfig");
const { pullCloudRecords } = require("../aws/awsCloudSyncClient");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * If record is missing locally, trigger an automatic bootstrap sync and retry.
 * This keeps first-login flow automatic even when local DB starts empty.
 */
async function ensureRecordWithBootstrap(loadRecord, options = {}) {
  const retries = Number(options.retries || 3);
  const delayMs = Number(options.delayMs || 1200);
  const trigger = options.trigger || "auth";
  const triggerCollections = {
    "student-login": ["students"],
    "teacher-login": ["teachers"],
    "schooladmin-login": ["schoolAdmins"],
    "superadmin-login": ["superAdmins"],
  };
  const collections = Array.isArray(options.collections) && options.collections.length
    ? options.collections
    : triggerCollections[trigger]
      ? triggerCollections[trigger]
    : undefined;

  let record = await loadRecord();
  if (record) {
    return record;
  }

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const cycle = appConfig.aws.syncEnabled
      ? await pullCloudRecords({
          collections,
          forceFull: true,
          limit: Number(process.env.AWS_BOOTSTRAP_PULL_LIMIT || process.env.AWS_SYNC_PULL_LIMIT || 5000),
        })
      : await runAutoSyncCycle({
          trigger: `${trigger}-bootstrap`,
          forceBootstrap: true,
        });

    if (cycle && cycle.skipped && cycle.reason === "in-progress") {
      await sleep(delayMs);
    }

    record = await loadRecord();
    if (record) {
      return record;
    }

    if (cycle && cycle.ok) {
      await sleep(250);
      record = await loadRecord();
      if (record) {
        return record;
      }
      continue;
    }

    // If sync failed hard (no source reachable), no need to retry aggressively.
    if (cycle && cycle.error) {
      break;
    }
  }

  return null;
}

module.exports = {
  ensureRecordWithBootstrap,
};
