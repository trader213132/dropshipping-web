# Architectural Decisions

## 2026-06-22 — Use Next.js App Router with Server Components

**Decision:** Use Next.js 15 App Router as the primary framework.  
**Reason:** Server Components enable direct database access without an intermediate API layer for most reads. Route Groups cleanly separate marketing, authentication, and application shells. The App Router's layout system maps naturally to the multi-level workspace → brand → feature hierarchy.  
**Tradeoff:** App Router is more complex than Pages Router; client/server boundary management requires discipline. Team must understand when to add `"use client"`.

## 2026-06-22 — PostgreSQL + Prisma ORM

**Decision:** PostgreSQL as the primary database with Prisma as the ORM.  
**Reason:** Prisma's type-safe query builder eliminates a class of SQL injection bugs by construction. Its migration system keeps schema changes auditable. PostgreSQL's JSON support, row-level security capability, and ACID guarantees fit a multi-tenant SaaS.  
**Tradeoff:** Prisma generates a client from the schema — `pnpm db:generate` must be run after schema changes. Raw SQL is needed for complex analytics queries.

## 2026-06-22 — BullMQ + Redis for job queue with local fallback

**Decision:** Use BullMQ backed by Redis for background jobs, with an in-memory local fallback when Redis is unavailable.  
**Reason:** BullMQ provides reliable job scheduling, retries with backoff, and priority queues. The local fallback means development works without Redis.  
**Tradeoff:** Workers in the local queue share the Node.js process — long-running jobs can affect response times. In production, workers run in separate processes.

## 2026-06-22 — Radix UI primitives via shadcn/ui pattern

**Decision:** Build the UI component library on Radix UI primitives following the shadcn/ui approach (copy components into the repo rather than importing from a package).  
**Reason:** Radix handles accessibility (focus management, ARIA attributes, keyboard navigation) correctly. Owning the component code means full control over styling and behaviour without fighting a third-party API.  
**Tradeoff:** More files to maintain. Component updates require manual sync with upstream.

## 2026-06-22 — Env validation at startup with @t3-oss/env-nextjs

**Decision:** Validate all environment variables at startup using `@t3-oss/env-nextjs` + Zod.  
**Reason:** Silent misconfiguration is a common source of production bugs. Crashing at startup with a clear error is safer than running with invalid config.  
**Tradeoff:** Every new required variable must be added to `lib/env.ts`. The `SKIP_ENV_VALIDATION=true` escape hatch is available for CI steps that build without a real database.

## 2026-06-22 — Audit log abstraction: logger now, database later

**Decision:** Audit entries write to the structured logger in Phase 0. Phase 1 switches to a database table.  
**Reason:** Avoids premature schema design before the auth and workspace models exist. The abstraction (`server/audit/index.ts`) means callers don't change when the backend changes.  
**Tradeoff:** Audit logs are not queryable or persistent in Phase 0.

## 2026-06-22 — Feature flags via environment variables in Phase 0

**Decision:** Feature flags read from environment variables in Phase 0. Phase 12 introduces database-backed flags with per-workspace overrides.  
**Reason:** Env-var flags are simple and zero-dependency. The abstraction is in place so callers don't change when the backend is upgraded.  
**Tradeoff:** No runtime flag changes without a deploy in Phases 0–11.

## 2026-06-22 — Local filesystem storage provider

**Decision:** Object storage defaults to the local filesystem in development. S3/GCS adapters are stubs.  
**Reason:** Eliminates the need for cloud storage credentials in local development. The interface is already defined so adding S3 in Phase 6 is straightforward.  
**Tradeoff:** Local files are not shared across instances. Must migrate to S3 before any multi-instance deployment.
