# Local Development Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Docker Desktop | latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Git | ≥ 2.40 | [git-scm.com](https://git-scm.com) |

> **Windows users:** Docker Desktop requires WSL 2 or Hyper-V. After installation, restart your machine before running `docker compose up -d`.

---

## First-Time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd commerceforge-ai

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL and AUTH_SECRET

# 4. Start Docker services (PostgreSQL + Redis)
docker compose up -d

# 5. Generate Prisma client
pnpm db:generate

# 6. Run database migrations
pnpm db:migrate

# 7. (Optional) Seed demo data
pnpm db:seed

# 8. Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Without Docker (Alternative)

### PostgreSQL

Install PostgreSQL 16 natively:
- **Windows:** Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@16`
- **Ubuntu:** `sudo apt install postgresql-16`

Create the development database:

```sql
CREATE USER commerceforge WITH PASSWORD 'commerceforge_dev';
CREATE DATABASE commerceforge_dev OWNER commerceforge;
```

Set `DATABASE_URL` in `.env.local`:
```
DATABASE_URL="postgresql://commerceforge:commerceforge_dev@localhost:5432/commerceforge_dev"
```

### Redis

- **Windows:** [Memurai](https://www.memurai.com/) (Redis-compatible Windows service)
- **macOS:** `brew install redis && brew services start redis`
- **Ubuntu:** `sudo apt install redis-server`

Without Redis, the app uses an in-memory job queue and rate limiter (fine for development).  
Leave `REDIS_URL` unset in `.env.local` to use the local fallback.

---

## Development Workflow

```bash
pnpm dev            # Hot-reload dev server (http://localhost:3000)
pnpm test:watch     # Vitest in watch mode
pnpm db:studio      # Prisma Studio at http://localhost:5555
```

### Before committing

```bash
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm test           # Unit tests
```

### Running E2E tests

The dev server must be running:

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm test:e2e

# Or with UI
pnpm test:e2e:ui
```

---

## Useful Docker Commands

```bash
docker compose up -d          # Start services (background)
docker compose down           # Stop services
docker compose logs postgres  # Postgres logs
docker compose logs redis     # Redis logs
docker compose ps             # Service status
```

---

## Environment Variables

All variables are documented in `.env.example`. Variables required for local development:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | — | ≥ 32 random characters |
| `REDIS_URL` | Optional | — | Local queue used if unset |
| `DEMO_MODE` | Optional | `true` | Enables demo data |
| `LOG_LEVEL` | Optional | `debug` | `debug` in dev |

Generate `AUTH_SECRET`: `openssl rand -base64 32` (or use any 32+ char random string in development).

---

## Troubleshooting

**`Error: Cannot find module '@prisma/client'`**
Run `pnpm db:generate` after installing dependencies.

**`Error: P1001 Can't reach database server`**
Ensure Docker is running: `docker compose up -d`. Check logs: `docker compose logs postgres`.

**`Error: AUTH_SECRET must be at least 32 characters`**
Add `AUTH_SECRET` to `.env.local` with a 32+ character string.

**Hydration mismatch warning in dev**
Expected with `next-themes` during initial render. It resolves on page load and does not affect production.

**`Port 3000 is already in use`**
Kill the existing process: `npx kill-port 3000` or start on a different port: `pnpm dev -- -p 3001`.
