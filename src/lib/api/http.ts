/**
 * Thin fetch wrapper for the Healthy Menu API.
 *
 * Responsibilities:
 * - Build URLs via `apiUrl()` and serialize query params (skips empty values).
 * - Attach `Accept: application/json`, JSON `Content-Type` (omitted for
 *   `FormData` so the browser sets the multipart boundary), and the Bearer token
 *   when `auth` is enabled and a token exists.
 * - Parse the response and, on failure, throw a normalized {@link ApiError}
 *   carrying the backend `message`/`code`/`errors`.
 * - Handle 401 globally: clear the token and invoke the registered handler
 *   (set by the admin auth layer to redirect to login).
 *
 * It returns the FULL parsed envelope (so callers read both `data` and `meta`).
 */
import { apiUrl } from "./config";
import { ApiError, type FieldErrors } from "./api-error";
import { getToken, clearToken } from "./auth-token";

/* ----------------------- Global 401 handling --------------------------- */

let unauthorizedHandler: (() => void) | null = null;

/** Register a callback fired after any 401 (token is already cleared). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/* ----------------------------- Query string ----------------------------- */

export type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue>;

export function toQueryString(params?: QueryParams): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.append(key, String(value));
  }
  const query = usp.toString();
  return query ? `?${query}` : "";
}

/* ------------------------------- Request -------------------------------- */

type RequestOptions = {
  method?: string;
  query?: QueryParams;
  /** JSON-serialized unless it is a `FormData` instance. */
  body?: unknown;
  /** Attach the Bearer token (default: true). Pass false for public endpoints. */
  auth?: boolean;
  /**
   * Skip the global 401 handling (token clear + redirect) for this call. Used by
   * the login request, where a 401 means "invalid credentials" and should be
   * shown inline rather than triggering an app-wide unauthenticated redirect.
   */
  skipAuthRedirect?: boolean;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, auth = true, skipAuthRedirect = false, signal } = options;

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl(path)}${toQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError({
      status: 0,
      message: "Network error. Please check your connection and try again.",
    });
  }

  const text = await response.text();
  const json = text ? safeParse(text) : null;

  if (!response.ok) {
    const message =
      (typeof json?.message === "string" && json.message) ||
      response.statusText ||
      "Request failed.";
    const code = typeof json?.code === "string" ? json.code : null;
    const fieldErrors = (json?.errors as FieldErrors | undefined) ?? null;

    if (response.status === 401 && !skipAuthRedirect) {
      clearToken();
      unauthorizedHandler?.();
    }
    throw new ApiError({ status: response.status, message, code, fieldErrors });
  }

  return json as T;
}

function safeParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* --------------------------- Convenience verbs -------------------------- */

export const http = {
  get: <T>(path: string, query?: QueryParams, auth = true, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", query, auth, signal }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: "PUT", body, auth }),
  del: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE", auth }),
  /** Multipart upload (e.g. product image); `Content-Type` is set by the browser. */
  postForm: <T>(path: string, form: FormData, auth = true) =>
    request<T>(path, { method: "POST", body: form, auth }),
};
