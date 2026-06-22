# Architecture

## Overview

CommerceForge AI is a multi-tenant Next.js 15 App Router application. All data is scoped to workspaces. A workspace can contain multiple brands, each with products, stores, campaigns, and research projects.

## Tenant Isolation Model

```
User
 └── WorkspaceMember (role)
      └── Workspace
           ├── Brand
           │    ├── Store
           │    ├── Product (pipeline)
           │    ├── CreativeCampaign
           │    └── ResearchProject
           ├── Supplier
           ├── Integration
           └── AuditLog
```

Every database query that reads or writes tenant data must:
1. Accept a `workspaceId` from the authenticated session (never from client input).
2. Include `WHERE workspace_id = $workspaceId` in all queries.
3. Verify the calling user is a member of that workspace with the required role.

## Directory Layout

```
app/
  (marketing)/     Public marketing routes — no auth required
  (app)/           Authenticated application shell (Phase 1+)
  api/             Route handlers — all protected server-side
  
components/
  ui/              Radix-based primitive components
  layout/          Layout shells (sidebar, page header)
  shared/          Reusable cross-feature components
  providers/       React context providers

features/          One directory per domain feature
  auth/            Authentication (Phase 1)
  workspaces/      Workspace + member management (Phase 1)
  brands/          Brand management (Phase 2)
  product-radar/   Product discovery (Phase 3)
  pipeline/        Research pipeline (Phase 4)
  suppliers/       Supplier hub (Phase 5)
  brand-studio/    Brand identity generation (Phase 6)
  store-builder/   Store generation and editor (Phase 7)
  creative-lab/    Marketing copy and assets (Phase 8)
  analytics/       Performance analytics (Phase 10)
  automations/     Workflow automation (Phase 11)
  billing/         Subscriptions and credits (Phase 12)

lib/               Shared utilities (no business logic)
server/            Server-only infrastructure
  queue/           Job queue (BullMQ / local)
  storage/         Object storage (S3 / local)
  feature-flags/   Feature flag resolution
  audit/           Audit log writing

integrations/      External service adapter interfaces
  shopify/         Shopify adapter (Phase 9)
  stripe/          Stripe adapter (Phase 12)
  ai/              AI provider adapter (Phase 6+)

jobs/              Background job definitions (Phase 11+)
prisma/            Prisma schema and migrations
tests/
  unit/            Vitest tests — fast, no I/O
  e2e/             Playwright tests — require running app
```

## Request Flow

```
Browser → Next.js middleware (auth check, workspace resolution)
        → App Router page (Server Component, reads from DB directly)
        → Server Action / API Route (validates session + permissions)
        → Prisma (scoped query with workspaceId)
        → PostgreSQL
```

Server Components fetch data directly via Prisma.  
Client Components use TanStack Query for dynamic data.  
Mutations use Server Actions or `fetch` to API routes.

## Key Abstractions

### Environment Validation (`lib/env.ts`)
All environment variables are validated at startup with Zod via `@t3-oss/env-nextjs`. Missing required variables crash the process with a clear error — no silent failures.

### Error Handling (`lib/errors.ts`)
Typed error classes extend `AppError`. Each has a machine-readable `code`, `statusCode`, and optional `context`. API routes use `handleApiError()` to convert to standardised JSON.

### API Responses (`lib/api-response.ts`)
All API routes return `{ success: true, data, meta? }` or `{ success: false, error: { code, message, details? } }`.

### Job Queue (`server/queue/`)
`enqueueJob()` dispatches to BullMQ when Redis is available, or to an in-memory local queue in development. Workers live in `jobs/`.

### Storage (`server/storage/`)
`uploadFile()`, `downloadFile()`, `deleteFile()` delegate to the configured provider. Local provider uses the filesystem. S3 provider added in Phase 6.

### Feature Flags (`server/feature-flags/`)
`isFeatureEnabled(flag, context?)` resolves flags from environment variables in Phase 0. Phase 12 adds a DB-backed system with per-workspace overrides.

### Audit Logs (`server/audit/`)
`audit(entry)` records sensitive actions. Phase 0: writes to the structured logger. Phase 1: persists to the `audit_logs` table.

## Authorization

Authorization is **always server-side**. The pattern:

```typescript
// 1. Get session
const session = await getServerSession();
if (!session) throw new UnauthorizedError();

// 2. Verify workspace membership and role
const member = await requireWorkspaceMember(session.user.id, workspaceId, "ADMIN");

// 3. Scope queries to workspace
const data = await db.brand.findMany({ where: { workspaceId } });
```

Client-side permission checks are for UI purposes only and are never trusted for data access.

## Database Schema Strategy

- All tables use `cuid()` for primary keys.
- Workspace-scoped records have `workspace_id NOT NULL`.
- Soft deletion via `deleted_at TIMESTAMP NULL` on important records.
- Audit-sensitive tables record `created_by`, `updated_by`.
- Migrations are additive. Never drop or rename columns without a transition period.
