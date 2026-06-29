const fetch = require("node-fetch");
const { appConfig } = require("../config/appConfig");

const DEFAULT_TIMEOUT_MS = Number(process.env.AWS_CONTROL_TIMEOUT_MS || 8000);

function isConfigured() {
  return Boolean(appConfig.aws.controlApiUrl);
}

function getAwsFeatures() {
  return {
    sync: appConfig.aws.syncEnabled,
    backupSync: appConfig.aws.backupSyncEnabled,
    videoSync: appConfig.aws.videoSyncEnabled,
    updateCheck: appConfig.aws.updateCheckEnabled,
  };
}

function buildUrl(path, query = {}) {
  const base = appConfig.aws.controlApiUrl.replace(/\/+$/, "");
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function request(path, options = {}) {
  if (!isConfigured()) {
    return {
      ok: false,
      enabled: false,
      reachable: false,
      status: "disabled",
      message: "AWS control API is disabled",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const headers = {
      "content-type": "application/json",
      ...(options.protected === false ? {} : { "x-api-key": appConfig.aws.controlApiKey }),
      ...(options.headers || {}),
    };

    const response = await fetch(buildUrl(path, options.query), {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_error) {
      data = { raw: text };
    }

    return {
      ok: response.ok,
      enabled: true,
      reachable: true,
      statusCode: response.status,
      data,
      lastCheckedAt: new Date().toISOString(),
      lastError: response.ok ? null : data.error || data.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      enabled: true,
      reachable: false,
      status: "unreachable",
      lastCheckedAt: new Date().toISOString(),
      lastError: error.name === "AbortError" ? "AWS control API request timed out" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getStatus() {
  if (!isConfigured()) {
    return {
      enabled: false,
      reachable: false,
      schoolId: appConfig.aws.schoolId,
      nodeId: appConfig.aws.nodeId,
      lastCheckedAt: new Date().toISOString(),
      lastError: null,
      features: getAwsFeatures(),
      buckets: {
        updates: appConfig.aws.updatesBucket || null,
        schoolData: appConfig.aws.schoolDataBucket || null,
      },
    };
  }

  const result = await request("/health", { protected: false });
  return {
    enabled: true,
    reachable: result.reachable && result.ok,
    schoolId: appConfig.aws.schoolId,
    nodeId: appConfig.aws.nodeId,
    lastCheckedAt: result.lastCheckedAt,
    lastError: result.ok ? null : result.lastError,
    features: getAwsFeatures(),
    buckets: {
      updates: appConfig.aws.updatesBucket || null,
      schoolData: appConfig.aws.schoolDataBucket || null,
    },
  };
}

module.exports = {
  appConfig,
  buildUrl,
  getAwsFeatures,
  getStatus,
  isConfigured,
  request,
};
