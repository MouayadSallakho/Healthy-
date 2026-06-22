/**
 * Central configuration for the Barbell Kitchen backend (Healthy Menu API).
 *
 * `NEXT_PUBLIC_API_BASE_URL` is the backend origin + project path **without** the
 * `/api` prefix (e.g. `https://technosolutions.sy/barbell-api`). The `/api`
 * prefix is added by `apiUrl()` so endpoint paths read exactly like the docs:
 * `/menu/products`, `/admin/products`, `/auth/login`.
 *
 * A production default is provided so the app still works if the env var is
 * missing; set the var in `.env.local` to override (e.g. for local dev against
 * `http://127.0.0.1:8000`). Source of truth: `docs/backend-api/docs.json`.
 */
const DEFAULT_API_BASE_URL = "https://technosolutions.sy/barbell-api";

/** Backend base URL (no trailing slash, no `/api` prefix). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || DEFAULT_API_BASE_URL;

/** API prefix shared by every route in the spec. */
export const API_PREFIX = "/api";

/**
 * Build a full API URL from a prefixed path.
 * @example apiUrl("/menu/products") -> "https://…/barbell-api/api/menu/products"
 */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${clean}`;
}
