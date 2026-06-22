import { describe, it, expect } from "vitest";
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  isAppError,
  getErrorMessage,
  toSafeError,
} from "@/lib/errors";

describe("AppError", () => {
  it("has the correct properties", () => {
    const err = new AppError("test error", "BAD_REQUEST", 400, { field: "name" });
    expect(err.message).toBe("test error");
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.statusCode).toBe(400);
    expect(err.context).toEqual({ field: "name" });
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("UnauthorizedError", () => {
  it("uses default message and 401 status", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("uses 403 status", () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });
});

describe("NotFoundError", () => {
  it("includes resource name in message", () => {
    const err = new NotFoundError("Workspace");
    expect(err.message).toBe("Workspace not found");
    expect(err.statusCode).toBe(404);
  });
});

describe("ValidationError", () => {
  it("uses 422 status", () => {
    expect(new ValidationError("invalid input").statusCode).toBe(422);
  });
});

describe("RateLimitError", () => {
  it("uses 429 status", () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new UnauthorizedError())).toBe(true);
  });

  it("returns false for plain errors", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("returns false for non-errors", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns string directly", () => {
    expect(getErrorMessage("oops")).toBe("oops");
  });

  it("returns fallback for unknown", () => {
    expect(getErrorMessage(42)).toBe("An unexpected error occurred");
  });
});

describe("toSafeError", () => {
  it("returns AppError code for app errors", () => {
    const result = toSafeError(new ForbiddenError());
    expect(result.code).toBe("FORBIDDEN");
  });

  it("returns INTERNAL_ERROR for unknown errors", () => {
    const result = toSafeError(new Error("crash"));
    expect(result.code).toBe("INTERNAL_ERROR");
  });
});
