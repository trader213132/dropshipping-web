/**
 * Application configuration derived from environment variables.
 * Import this instead of accessing process.env directly.
 */

export const appConfig = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "CommerceForge AI",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    demoMode: process.env.DEMO_MODE === "true",
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    url: process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
  storage: {
    provider: (process.env.STORAGE_PROVIDER ?? "local") as "local" | "s3" | "gcs",
    localPath: process.env.STORAGE_LOCAL_PATH ?? "./uploads",
    s3: {
      bucket: process.env.STORAGE_S3_BUCKET,
      region: process.env.STORAGE_S3_REGION,
    },
  },
  rateLimit: {
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
    windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60),
  },
  features: {
    storeBuilder: process.env.FEATURE_FLAG_STORE_BUILDER === "true",
    aiGeneration: process.env.FEATURE_FLAG_AI_GENERATION === "true",
    shopifyIntegration: process.env.FEATURE_FLAG_SHOPIFY_INTEGRATION === "true",
    billing: process.env.FEATURE_FLAG_BILLING === "true",
  },
  integrations: {
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    hasShopify: !!process.env.SHOPIFY_CLIENT_ID,
    hasResend: !!process.env.RESEND_API_KEY,
  },
} as const;
