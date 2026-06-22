import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ]
        : [{ emit: "event", level: "error" }],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;

  db.$on("query" as never, (e: { query: string; duration: number }) => {
    if (process.env.LOG_LEVEL === "debug") {
      logger.debug({ query: e.query, duration: e.duration }, "Prisma query");
    }
  });

  db.$on("error" as never, (e: { message: string }) => {
    logger.error({ message: e.message }, "Prisma error");
  });
}
