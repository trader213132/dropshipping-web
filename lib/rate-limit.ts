import { headers } from "next/headers";
import { RateLimitError } from "./errors";
import { logger } from "./logger";

interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetAt: number } | null>;
  increment(key: string, windowSeconds: number): Promise<{ count: number; resetAt: number }>;
}

/**
 * In-memory rate limit store for development / when Redis is unavailable.
 * Not suitable for multi-instance production deployments.
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.resetAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  async increment(key: string, windowSeconds: number) {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetAt) {
      const entry = { count: 1, resetAt: now + windowSeconds * 1000 };
      this.store.set(key, entry);
      return entry;
    }

    existing.count++;
    return existing;
  }
}

let rateLimitStore: RateLimitStore = new InMemoryRateLimitStore();

export function setRateLimitStore(store: RateLimitStore) {
  rateLimitStore = store;
}

export interface RateLimitOptions {
  maxRequests?: number;
  windowSeconds?: number;
  keyPrefix?: string;
}

export async function rateLimit(identifier: string, options: RateLimitOptions = {}) {
  const maxRequests = options.maxRequests ?? Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);
  const windowSeconds = options.windowSeconds ?? Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);
  const key = `${options.keyPrefix ?? "rl"}:${identifier}`;

  const result = await rateLimitStore.increment(key, windowSeconds);

  if (result.count > maxRequests) {
    logger.warn({ key, count: result.count, maxRequests }, "Rate limit exceeded");
    throw new RateLimitError();
  }

  return {
    remaining: Math.max(0, maxRequests - result.count),
    resetAt: new Date(result.resetAt),
  };
}

export async function getClientIdentifier(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
