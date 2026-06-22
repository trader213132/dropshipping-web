import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError, toSafeError, type ErrorCode } from "./errors";
import { logger } from "./logger";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function apiError(
  code: ErrorCode,
  message: string,
  details?: unknown,
  status = 500,
) {
  const body: ApiError = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown, requestContext?: string) {
  if (isAppError(error)) {
    if (error.statusCode >= 500) {
      logger.error({ err: error, context: requestContext }, "Application error");
    }
    return apiError(error.code, error.message, error.context, error.statusCode);
  }

  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Validation failed",
      error.flatten().fieldErrors,
      422,
    );
  }

  logger.error({ err: error, context: requestContext }, "Unhandled error");
  const { message, code } = toSafeError(error);
  return apiError(code, message, undefined, 500);
}
