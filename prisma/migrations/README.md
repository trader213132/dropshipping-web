# Migrations

Run `pnpm db:migrate` after `docker compose up -d` to apply all migrations.

Phase 1 migration creates:
- `users` — Auth.js users with optional passwordHash
- `accounts` — OAuth accounts (Auth.js)
- `sessions` — database sessions (Auth.js)
- `verification_tokens` — magic links (Auth.js)
- `workspaces` — tenant workspaces
- `memberships` — workspace role assignments
- `system_meta` — health / migration tracking (Phase 0)
