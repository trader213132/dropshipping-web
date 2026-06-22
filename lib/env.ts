import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables — never exposed to the client.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    AUTH_URL: z.string().url().optional(),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    STORAGE_PROVIDER: z.enum(["local", "s3", "gcs"]).default("local"),
    STORAGE_LOCAL_PATH: z.string().default("./uploads"),
    STORAGE_S3_BUCKET: z.string().optional(),
    STORAGE_S3_REGION: z.string().optional(),
    STORAGE_S3_ACCESS_KEY_ID: z.string().optional(),
    STORAGE_S3_SECRET_ACCESS_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    SHOPIFY_CLIENT_ID: z.string().optional(),
    SHOPIFY_CLIENT_SECRET: z.string().optional(),
    SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),
    DEMO_MODE: z
      .string()
      .transform((v) => v === "true")
      .default("true"),
  },

  /**
   * Client-side environment variables — safe to expose in the browser.
   * Must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z.string().default("CommerceForge AI"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },

  /**
   * Feature flags — client-safe booleans.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS: process.env.RATE_LIMIT_WINDOW_SECONDS,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH,
    STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET,
    STORAGE_S3_REGION: process.env.STORAGE_S3_REGION,
    STORAGE_S3_ACCESS_KEY_ID: process.env.STORAGE_S3_ACCESS_KEY_ID,
    STORAGE_S3_SECRET_ACCESS_KEY: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    DEMO_MODE: process.env.DEMO_MODE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
