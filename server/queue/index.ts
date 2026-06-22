import { logger } from "@/lib/logger";
import { LocalJobQueue } from "./providers/local";

export interface JobDefinition<T = unknown> {
  name: string;
  data: T;
  options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
    backoff?: { type: "fixed" | "exponential"; delay: number };
  };
}

export interface JobResult {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export interface JobQueue {
  register<T>(name: string, handler: (data: T) => Promise<unknown>): void;
  enqueue<T>(job: JobDefinition<T>): Promise<JobResult>;
  close(): Promise<void>;
}

const globalQueue = globalThis as unknown as { jobQueue: JobQueue | undefined };

function createQueue(): JobQueue {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && process.env.NODE_ENV !== "test") {
    try {
      // Lazy-load BullMQ to avoid bundling it in edge runtime
      const { Queue } = require("bullmq") as typeof import("bullmq");

      // Parse URL to plain options so BullMQ uses its own ioredis version
      const parsed = new URL(redisUrl);
      const connectionOptions = {
        host: parsed.hostname,
        port: Number(parsed.port) || 6379,
        password: parsed.password || undefined,
        db: Number(parsed.pathname.slice(1)) || 0,
        maxRetriesPerRequest: null as null,
      };

      logger.info("Using BullMQ + Redis job queue");

      return {
        register(_name, _handler) {
          // Workers are registered separately in jobs/ directory
        },
        async enqueue<T>(job: JobDefinition<T>) {
          const queue = new Queue(job.name, { connection: connectionOptions });
          const bullJob = await queue.add(job.name, job.data, {
            delay: job.options?.delay,
            priority: job.options?.priority,
            attempts: job.options?.attempts ?? 3,
            backoff: job.options?.backoff,
          });
          await queue.close();
          return { id: bullJob.id ?? `bull_${Date.now()}`, status: "queued" };
        },
        async close() {
          // Connection is managed per-queue instance
        },
      };
    } catch (err) {
      logger.warn({ err }, "BullMQ init failed; falling back to local queue");
    }
  }

  logger.info("Using local in-memory job queue (demo/dev mode)");
  return new LocalJobQueue();
}

export function getJobQueue(): JobQueue {
  if (!globalQueue.jobQueue) {
    globalQueue.jobQueue = createQueue();
  }
  return globalQueue.jobQueue;
}

export async function enqueueJob<T>(job: JobDefinition<T>): Promise<JobResult> {
  return getJobQueue().enqueue(job);
}
