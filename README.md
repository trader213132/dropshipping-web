# CommerceForge AI

**AI Commerce Operating System** — discover products, build brands, generate stores, and scale with confidence.

CommerceForge AI is a multi-tenant SaaS platform for dropshippers, Shopify sellers, agencies, and DTC brands. It combines product research, supplier intelligence, brand generation, store building, creative production, analytics, and automation into a single workspace-scoped platform.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local — DATABASE_URL and AUTH_SECRET are required

# 3. Start local services (requires Docker Desktop)
docker compose up -d

# 4. Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Docker Desktop must be installed and running for `docker compose up -d`.  
> See [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) for setup without Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache / Queue | Redis 7 + BullMQ |
| Auth | Auth.js (Phase 1) |
| Billing | Stripe (Phase 12) |
| Testing | Vitest + Playwright |
| Package manager | pnpm |

## Project Structure

```
app/                   Next.js App Router pages and API routes
  (marketing)/         Public marketing pages
  api/                 API route handlers
components/
  ui/                  Primitive UI components (shadcn/ui)
  layout/              Layout shells (sidebar, page header)
  shared/              Shared utility components
  providers/           React context providers
features/              Feature modules (added per phase)
lib/                   Shared utilities and abstractions
  env.ts               Environment variable validation
  logger.ts            Structured logger (pino)
  errors.ts            Typed error classes
  api-response.ts      Standardised API response format
  rate-limit.ts        Rate limiting abstraction
  db.ts                Prisma client singleton
  utils.ts             Pure utility functions
  config.ts            App configuration from env
server/
  queue/               Job queue abstraction (BullMQ / local)
  storage/             Object storage abstraction (S3 / local)
  feature-flags/       Feature flag system
  audit/               Audit log abstraction
prisma/
  schema.prisma        Database schema
jobs/                  Background job definitions (Phase 11)
integrations/          External service adapters (Phase 9+)
tests/
  unit/                Vitest unit tests
  e2e/                 Playwright end-to-end tests
docs/                  Technical documentation
```

## Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript check
pnpm format           # Prettier format
pnpm test             # Vitest unit tests
pnpm test:watch       # Vitest watch mode
pnpm test:e2e         # Playwright E2E tests
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema without migration
pnpm db:seed          # Seed demo data
pnpm db:studio        # Open Prisma Studio
```

## Environment Variables

See [`.env.example`](.env.example) for all variables. The minimum required for local development:

```env
DATABASE_URL="postgresql://commerceforge:commerceforge_dev@localhost:5432/commerceforge_dev"
AUTH_SECRET="your-secret-here-minimum-32-characters"
DEMO_MODE="true"
```

## Implementation Status

See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for the current phase completion status.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Local Development](docs/LOCAL_DEVELOPMENT.md)
- [Security](docs/SECURITY.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)
- [Decisions](docs/DECISIONS.md)

## License

Proprietary. All rights reserved.
