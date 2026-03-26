const { runAutoSyncCycle } = require("./autoSyncService");

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

  let record = await loadRecord();
  if (record) {
    return record;
  }

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const cycle = await runAutoSyncCycle({
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
