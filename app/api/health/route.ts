import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
  };
  uptime: number;
  environment: string;
}

interface ServiceStatus {
  status: "ok" | "degraded" | "down";
  latencyMs?: number;
  message?: string;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return {
      status: "down",
      latencyMs: Date.now() - start,
      message: "Cannot connect to database",
    };
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return { status: "degraded", message: "Redis not configured (using local fallback)" };
  }

  const start = Date.now();
  try {
    const { default: IORedis } = await import("ioredis");
    const client = new IORedis(redisUrl, { connectTimeout: 3000, lazyConnect: true });
    await client.connect();
    await client.ping();
    await client.quit();
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    logger.error({ err }, "Redis health check failed");
    return {
      status: "degraded",
      latencyMs: Date.now() - start,
      message: "Redis unavailable (using local fallback)",
    };
  }
}

export async function GET() {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const overallStatus: HealthStatus["status"] =
    database.status === "down"
      ? "down"
      : database.status === "degraded" || redis.status === "down"
        ? "degraded"
        : "ok";

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    services: { database, redis },
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "unknown",
  };

  const httpStatus = overallStatus === "down" ? 503 : 200;

  return NextResponse.json(health, { status: httpStatus });
}
