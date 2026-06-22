/**
 * Sanctum access-token storage for the admin dashboard.
 *
 * The token is kept in `localStorage` (survives refresh) with an in-memory cache
 * for fast synchronous reads. All access is SSR-safe (guards `typeof window`),
 * so importing this module never breaks server rendering. The backend has no
 * `/auth/me`; the login `user` object is stored separately by the auth layer
 * (a later phase).
 */
const STORAGE_KEY = "bk-admin-token";

let cached: string | null = null;
let loaded = false;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    cached = window.localStorage.getItem(STORAGE_KEY);
    loaded = true;
  }
  return cached;
}

export function setToken(token: string): void {
  cached = token;
  loaded = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, token);
  }
}

export function clearToken(): void {
  cached = null;
  loaded = true;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasToken(): boolean {
  return getToken() !== null;
}
