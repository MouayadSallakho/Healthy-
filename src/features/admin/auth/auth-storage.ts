/**
 * Persists the admin user object (from the login response) alongside the token.
 * There is no `/auth/me` endpoint, so this is the source of the current user
 * after a page refresh. SSR-safe (guards `typeof window`); never throws.
 */
import type { AuthUser } from "@/lib/api";

const USER_KEY = "bk-admin-user";

let cached: AuthUser | null = null;
let loaded = false;

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      cached = raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      cached = null;
    }
    loaded = true;
  }
  return cached;
}

export function setStoredUser(user: AuthUser): void {
  cached = user;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore quota/serialization errors */
    }
  }
}

export function clearStoredUser(): void {
  cached = null;
  loaded = true;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_KEY);
  }
}
