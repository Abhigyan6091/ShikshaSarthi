const LOCAL_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const SYNC_ENABLED = String(import.meta.env.VITE_SYNC_ENABLED || "true").toLowerCase() !== "false";
const SYNC_INTERVAL_MS = 60_000;

let syncInProgress = false;
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

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

function getUserKey(): string | null {
  try {
    const user = window.localStorage.getItem('currentUser');
    const role = window.localStorage.getItem('userRole');
    if (!user || !role) return null;
    const parsed = JSON.parse(user);
    const id = parsed.studentId || parsed.teacherId || parsed.username || parsed._id;
    return id ? `${role}_${id}` : null;
  } catch {
    return null;
  }
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
  const userKey = getUserKey();
  if (!userKey || !lastSync) {
    return;
  }
  window.localStorage.setItem(`offlineSync.lastSync_${userKey}`, lastSync);
}

function shouldForceBootstrap() {
  const userKey = getUserKey();
  if (!userKey) return false;

  const key = `offlineSync.bootstrapRequested_${userKey}`;
  const alreadyRequested = window.localStorage.getItem(key) === "true";
  if (alreadyRequested) {
    return false;
  }

  window.localStorage.setItem(key, "true");
  return true;
}

export async function runDeltaSync() {
  if (!SYNC_ENABLED || !hasWindow()) {
    return;
  }

  if (!getUserKey()) {
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

function triggerSync() {
  runDeltaSync();
}

function startInterval() {
  if (syncIntervalId !== null) return;
  syncIntervalId = setInterval(triggerSync, SYNC_INTERVAL_MS);
}

function stopInterval() {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

export function startSyncManager() {
  if (!SYNC_ENABLED || !hasWindow()) {
    return () => { };
  }

  const onlineHandler = () => triggerSync();
  window.addEventListener("online", onlineHandler);

  const loginHandler = () => {
    startInterval();
    triggerSync();
  };
  window.addEventListener("userLoggedIn", loginHandler);

  const logoutHandler = () => {
    stopInterval();
  };
  window.addEventListener("userLoggedOut", logoutHandler);

  if (getUserKey()) {
    startInterval();
    triggerSync();
  }

  return () => {
    stopInterval();
    window.removeEventListener("online", onlineHandler);
    window.removeEventListener("userLoggedIn", loginHandler);
    window.removeEventListener("userLoggedOut", logoutHandler);
  };
}
