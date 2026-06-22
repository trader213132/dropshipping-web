import { logger } from "@/lib/logger";
import type { JobQueue, JobDefinition, JobResult } from "../index";

/**
 * In-memory job queue for local development and demo mode.
 * Jobs are executed synchronously in the same process.
 * Not suitable for production — use BullMQ + Redis instead.
 */
export class LocalJobQueue implements JobQueue {
  private handlers = new Map<string, (data: unknown) => Promise<unknown>>();

  register<T>(name: string, handler: (data: T) => Promise<unknown>): void {
    this.handlers.set(name, handler as (data: unknown) => Promise<unknown>);
  }

  async enqueue<T>(job: JobDefinition<T>): Promise<JobResult> {
    const handler = this.handlers.get(job.name);

    if (!handler) {
      logger.warn({ jobName: job.name }, "No handler registered for job");
      return { id: `local_${Date.now()}`, status: "failed" };
    }

    const id = `local_${job.name}_${Date.now()}`;
    logger.debug({ jobId: id, jobName: job.name }, "Executing local job");

    const delay = job.options?.delay ?? 0;
    const run = async () => {
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
      try {
        await handler(job.data);
        logger.debug({ jobId: id }, "Local job completed");
      } catch (err) {
        logger.error({ jobId: id, err }, "Local job failed");
      }
    };

    // Run asynchronously but don't block the caller
    void run();

    return { id, status: "queued" };
  }

  async close(): Promise<void> {
    // No-op for local queue
  }
}
