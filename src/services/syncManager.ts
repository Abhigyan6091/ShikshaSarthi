const LOCAL_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const SYNC_ENABLED = String(import.meta.env.VITE_SYNC_ENABLED || "true").toLowerCase() !== "false";
const SYNC_INTERVAL_MS = 60_000;

const LAST_SYNC_KEY = "offlineSync.lastSync";
const FIRST_BOOTSTRAP_KEY = "offlineSync.bootstrapRequested";

let syncInProgress = false;

interface SyncRunResponse {
  ok?: boolean;
  skipped?: boolean;
  reason?: string;
  state?: {
    lastSync?: string | null;
    status?: string;
    lastError?: string | null;
  };
}

function hasWindow() {
  return typeof window !== "undefined";
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  return response.json();
}

function setLastSync(lastSync?: string | null) {
  if (!hasWindow() || !lastSync) {
    return;
  }

  window.localStorage.setItem(LAST_SYNC_KEY, lastSync);
}

function shouldForceBootstrap() {
  if (!hasWindow()) {
    return false;
  }

  const alreadyRequested = window.localStorage.getItem(FIRST_BOOTSTRAP_KEY) === "true";
  if (alreadyRequested) {
    return false;
  }

  window.localStorage.setItem(FIRST_BOOTSTRAP_KEY, "true");
  return true;
}

export async function runDeltaSync() {
  if (!SYNC_ENABLED || !hasWindow()) {
    return;
  }

  if (syncInProgress) {
    return;
  }

  syncInProgress = true;

  try {
    const response = await requestJson<SyncRunResponse>(`${LOCAL_API_URL}/sync/run`, {
      method: "POST",
      body: JSON.stringify({
        trigger: "frontend-online",
        forceBootstrap: shouldForceBootstrap(),
      }),
    });

    setLastSync(response.state?.lastSync || null);

    if (response.skipped && response.reason) {
      console.warn(`Sync skipped: ${response.reason}`);
    }

    if (response.state?.status === "error" && response.state.lastError) {
      console.error(`Sync error: ${response.state.lastError}`);
    }
  } catch (error) {
    console.error("Delta sync failed:", error);
  } finally {
    syncInProgress = false;
  }
}

export function startSyncManager() {
  if (!SYNC_ENABLED || !hasWindow()) {
    return () => {};
  }

  const triggerSync = () => {
    runDeltaSync();
  };

  window.addEventListener("online", triggerSync);

  triggerSync();

  const intervalId = window.setInterval(() => {
    triggerSync();
  }, SYNC_INTERVAL_MS);

  return () => {
    window.removeEventListener("online", triggerSync);
    window.clearInterval(intervalId);
  };
}
