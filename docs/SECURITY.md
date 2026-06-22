# Security

## Principles

1. **Never trust the client.** All authorization decisions are made server-side.
2. **Workspace isolation is mandatory.** Every data query must be scoped to a workspace with verified membership.
3. **Secrets never leave the server.** No credentials, tokens, or API keys in client bundles, logs, or error responses.
4. **Fail closed.** When authorization is uncertain, deny access.
5. **Audit sensitive actions.** Every destructive or privileged operation is logged with user, workspace, and timestamp.

## Authentication (Phase 1)

- Session tokens are stored in HttpOnly, Secure, SameSite=Strict cookies.
- Sessions are validated on every server request via `getServerSession()`.
- Password hashing uses bcrypt (≥ 12 rounds) or equivalent.
- Magic links expire after 15 minutes and are single-use.
- OAuth state parameters are validated on callback.

## Authorization

Role hierarchy: `SUPER_ADMIN > OWNER > ADMIN > MEMBER > ANALYST > DESIGNER > CLIENT_READONLY`

Permissions are checked in three layers:
1. **Middleware** — blocks unauthenticated requests to `/app/**`.
2. **Server Actions / API routes** — verify role before any data access.
3. **Database layer** — every query includes `workspaceId` from the verified session.

Never derive `workspaceId` from client input. Always read it from the server session or the authenticated route parameter verified against the session.

## Input Validation

All user input is validated with Zod before processing. API routes use `schema.safeParse()` and return `422` on validation failure. Database queries use Prisma's parameterised queries — no raw SQL with user input unless parameterised.

## Rate Limiting

Sensitive endpoints (auth, AI generation, password reset) are rate-limited per IP. The abstraction in `lib/rate-limit.ts` uses Redis in production and an in-memory fallback in development.

## Webhook Security

All incoming webhooks (Shopify, Stripe) verify the signature before processing. Webhook handlers are idempotent — processing the same event twice produces the same result.

## Secret Management

- Secrets are loaded from environment variables, never committed to source control.
- `lib/env.ts` validates all required secrets at startup.
- Third-party API credentials are stored encrypted in the database (Phase 9+).
- Credentials are never returned in API responses or included in logs.

## HTTP Security Headers (Phase 13)

To be added:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

## Data Isolation

Multi-tenant data isolation is enforced by including `workspaceId` in every query for workspace-scoped records. Phase 13 includes an automated isolation audit to catch queries missing the workspace filter.

## Known Assumptions and Limitations (Phase 0)

- Authentication is not yet implemented. All routes are publicly accessible.
- No CSRF protection yet (added in Phase 1 with Auth.js).
- No rate limiting on API routes yet (infrastructure ready, not wired up).
- No webhook signature verification yet (added in Phases 9 and 12).
- Docker Compose uses simple development passwords — change before any production deployment.
- The local file storage provider has no access control beyond filesystem permissions.

## Reporting Security Issues

Report security vulnerabilities privately. Do not file public GitHub issues for security bugs.
