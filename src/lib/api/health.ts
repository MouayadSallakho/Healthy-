/**
 * Public health check — useful for verifying backend reachability and that the
 * configured base URL is correct. Public endpoint, no auth.
 *
 * GET /api/menu/health -> { success, message, data: { module, status } }
 */
import { http } from "./http";
import type { ApiEnvelope, HealthData } from "./types";

export function getMenuHealth(signal?: AbortSignal): Promise<ApiEnvelope<HealthData>> {
  return http.get<ApiEnvelope<HealthData>>("/menu/health", undefined, false, signal);
}
