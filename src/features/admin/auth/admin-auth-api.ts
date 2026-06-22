/**
 * Admin authentication endpoints (Laravel Sanctum).
 *
 * - POST /api/auth/login  { email, password, device_name? } -> { token, token_type, user }
 * - POST /api/auth/logout (Bearer) -> revokes the current token
 *
 * Login uses `skipAuthRedirect` so a 401 (invalid credentials) is surfaced
 * inline by the form instead of triggering the global unauthenticated redirect.
 */
import { request } from "@/lib/api";
import type { ApiEnvelope, LoginRequest, LoginResponseData } from "@/lib/api";

export function login(credentials: LoginRequest): Promise<ApiEnvelope<LoginResponseData>> {
  return request<ApiEnvelope<LoginResponseData>>("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
    skipAuthRedirect: true,
  });
}

export function logout(): Promise<ApiEnvelope<null>> {
  return request<ApiEnvelope<null>>("/auth/logout", { method: "POST" });
}
