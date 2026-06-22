/**
 * Structured error types for CommerceForge AI.
 * All errors include a machine-readable code and HTTP status.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "BAD_REQUEST"
  | "PAYMENT_REQUIRED"
  | "QUOTA_EXCEEDED"
  | "WORKSPACE_NOT_FOUND"
  | "BRAND_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "INTEGRATION_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 422, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please slow down.") {
    super(message, "RATE_LIMITED", 429);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = "Usage quota exceeded. Please upgrade your plan.") {
    super(message, "QUOTA_EXCEEDED", 402);
  }
}

export class WorkspaceNotFoundError extends AppError {
  constructor() {
    super("Workspace not found or you do not have access", "WORKSPACE_NOT_FOUND", 404);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(action?: string) {
    super(
      action ? `Permission denied: ${action}` : "Permission denied",
      "PERMISSION_DENIED",
      403,
    );
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

export function toSafeError(error: unknown): { message: string; code: ErrorCode } {
  if (isAppError(error)) {
    return { message: error.message, code: error.code };
  }
  return { message: "An unexpected error occurred", code: "INTERNAL_ERROR" };
}
