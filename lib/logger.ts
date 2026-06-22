import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: isTest ? "silent" : (process.env.LOG_LEVEL ?? "info"),
  ...(isDev && !isTest
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

export type Logger = typeof logger;

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
