---
trigger: glob
globs: apps/admin/src/app/api/**
---

# RestoHub — Admin API Route Rules

Applies to all route handlers under `apps/admin/src/app/api/`.

## Handler shape (mandatory)

1. Wrap in `withAuth({ module, action })` or `withAuthParams(...)` from `@/lib/auth` — no unwrapped routes, especially mutations.
2. Validate body/query with Zod `schema.safeParse(...)`; on failure return the validation error list with status 400.
3. Access data via Prisma from `@/lib/prisma`; wrap the whole handler body in try/catch.
4. Return `NextResponse.json({ data })` on success; `{ message }` with proper status (400/401/403/404/500) on failure. 500s log `console.error("<context>:", err)` server-side and return a generic message — never leak Prisma errors or stack traces.

## Data rules

- Dynamic params are Promises: `const { id } = await ctx.params;`.
- Soft-delete models: filter `deletedAt: null` on every read; deletes set `deletedAt` (except explicitly hard-deleted entities like Media).
- List endpoints: `select` minimal fields, paginate (`take`/`skip` or `limit` param) — no unbounded `findMany`.
- `sortOrder` mutations go through `createOrdered`/`updateOrdered`/`runOrderingTransaction` (`@/lib/ordering`) — retries `P2034` up to 2×. Never hand-roll ordering math.
- `$queryRawUnsafe` is banned.

## Cross-cutting

- Mutations write `AuditLog` fire-and-forget: `.catch(err => console.error("Audit log failed:", err))` — audit failure must never fail the request.
- Media: upload paths via `buildStoragePath()`; deletion via `deleteMediaByUrl()` (storage object + `Media` row together, bucket `media`).
- Rate-limit brute-forceable endpoints (login, public writes) with `rateLimit` + `getClientIpFromHeaders`.
- Refresh token cookie: httpOnly, `sameSite: strict`, secure in prod, 7-day expiry, DB-tracked in `RefreshToken`.
