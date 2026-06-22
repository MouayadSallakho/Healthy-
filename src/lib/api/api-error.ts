/**
 * Normalized API error used across the app. Wraps the backend's
 * `{ success:false, message, code, errors }` envelope plus the HTTP status, so
 * UI code can branch on status/code and render field-level validation messages.
 *
 * Error codes from the backend include: VALIDATION.ERROR, AUTH.UNAUTHENTICATED,
 * AUTH.FORBIDDEN, RESOURCE.NOT_FOUND, CATEGORY.IN_USE, INGREDIENT.IN_USE,
 * GOAL.IN_USE.
 */

/** Field-level validation messages: `{ field: ["message", ...] }`. */
export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  /** HTTP status (0 = network/transport failure, no response received). */
  readonly status: number;
  /** Backend error code (e.g. "VALIDATION.ERROR"), when provided. */
  readonly code: string | null;
  /** Per-field validation messages (422), when provided. */
  readonly fieldErrors: FieldErrors | null;

  constructor(params: {
    status: number;
    message: string;
    code?: string | null;
    fieldErrors?: FieldErrors | null;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code ?? null;
    this.fieldErrors = params.fieldErrors ?? null;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isValidation(): boolean {
    return this.status === 422;
  }

  /** First message for a field, if any (handy for inline form errors). */
  fieldError(field: string): string | undefined {
    return this.fieldErrors?.[field]?.[0];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
