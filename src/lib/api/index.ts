/**
 * Barbell Kitchen API client — public barrel.
 *
 * Import from `@/lib/api` (config, HTTP wrapper, error type, token storage,
 * wire types, and the health check). Feature-specific endpoint modules
 * (public menu, admin CRUD) are added in later phases under `src/features/*`.
 */
export * from "./config";
export * from "./api-error";
export * from "./types";
export * from "./auth-token";
export * from "./http";
export * from "./health";
