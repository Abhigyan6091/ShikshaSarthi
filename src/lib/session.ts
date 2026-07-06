// Centralized session/auth-state management.
//
// The app historically scattered auth state across many localStorage keys
// (currentUser, student, teacher, superadmin, schooladmin, nmmsUser,
// Login_student, userRole, authToken) written by different login pages and
// only partially cleared on logout. That caused "previous user's profile
// shows up" and "already logged in on the login page" bleed. This module is
// the single source of truth for clearing/reading that state.

import Cookies from "js-cookie";

// Every key any login path has ever used to persist auth/session state,
// plus per-user client state that must not bleed across accounts in a shared
// browser (e.g. a teacher's in-progress quiz draft).
const AUTH_KEYS = [
  "currentUser",
  "userRole",
  "authToken",
  "student",
  "teacher",
  "schooladmin",
  "superadmin",
  "nmmsUser",
  "Login_student",
  "advancedQuizDraft.v1",
];

// Cookies a login path may have set (teacher login mirrors into a cookie).
const AUTH_COOKIES = ["teacher", "student", "authToken"];

/**
 * Remove every trace of a prior session. Call on logout and at the top of
 * every login page so a fresh login can never inherit stale state.
 */
export function clearAllAuth(): void {
  try {
    for (const key of AUTH_KEYS) {
      localStorage.removeItem(key);
    }
    for (const cookie of AUTH_COOKIES) {
      Cookies.remove(cookie);
    }
  } catch (_error) {
    // localStorage can throw in rare privacy modes; ignore.
  }
}

export function getActiveRole(): string | null {
  try {
    return localStorage.getItem("userRole");
  } catch (_error) {
    return null;
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("authToken");
  } catch (_error) {
    return null;
  }
}

function safeParse(raw: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

/**
 * Return the current user in a normalized shape regardless of which login path
 * stored it. Handles the historical nesting variants:
 *   { student: {...} } | { teacher: {...} } | { user: {...} } | {...}
 */
export function getCurrentUser(): Record<string, any> | null {
  try {
    const candidates = [
      localStorage.getItem("currentUser"),
      localStorage.getItem("student"),
      localStorage.getItem("teacher"),
      localStorage.getItem("superadmin"),
      localStorage.getItem("schooladmin"),
      localStorage.getItem("Login_student"),
      localStorage.getItem("nmmsUser"),
    ];

    for (const raw of candidates) {
      const parsed = safeParse(raw);
      if (!parsed) continue;
      const user = parsed.student || parsed.teacher || parsed.user || parsed;
      if (user && (user._id || user.id || user.studentId || user.username)) {
        return user;
      }
    }
  } catch (_error) {
    // ignore
  }
  return null;
}

/** Graduation "batch" of the logged-in student (e.g. "2026"). */
export function getCurrentStudentBatch(): string | null {
  const user = getCurrentUser();
  // Prefer batch; fall back to the legacy class value for pre-migration records.
  const value = user?.batch ?? user?.class ?? null;
  return value != null ? String(value) : null;
}
