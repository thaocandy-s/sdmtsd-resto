---
trigger: always_on
---

# RestoHub — Core Engineering Standards (always apply)

Full reference: `.qoder/rules.md`. If a request conflicts with these rules, explain the conflict BEFORE writing code.

## Hard boundaries

- Dependency direction: `apps/*` → `packages/*` → `@resto-hub/config`. Never reverse; never cross-import between `apps/web` and `apps/admin`.
- Prisma access ONLY via the singleton from `@resto-hub/db` (re-exported by app-local `lib/prisma.ts`). Never `new PrismaClient()`.
- `packages/ui` stays presentational (Radix + Tailwind + CVA) — no data fetching, no business logic.
- Reuse before create: search `packages/ui|utils|types`, `lib/`, `shared/` before writing any helper/component/hook/type. Extend, don't duplicate.

## TypeScript

- `strict` mode; `any` is banned — use `unknown` + narrowing, generics, or `z.infer`.
- Shared domain types in `@resto-hub/types`; derive types (`Prisma.XGetPayload`, `Pick/Omit`) instead of redeclaring.
- Exhaustive `switch` over unions with `never` default.

## Next.js 15 / React 19

- Default to Server Components; `"use client"` only when needed.
- `params`/`searchParams` are Promises — always `await` them (pages, layouts, route handlers).
- Never pass raw Prisma objects (Date/Decimal/Json) to Client Components — serialize first.
- Never import server-only modules (Prisma, jsonwebtoken, bcryptjs, service-role Supabase) into client code.

## Security & API contract

- Every admin API route wrapped in `withAuth`/`withAuthParams` with correct `module:action`; Zod `safeParse` on ALL inputs.
- Response envelope fixed: success `{ data }`, error `{ message }` (400/401/403/404/500). Never change silently.
- Soft-delete models: always filter `deletedAt: null` on reads; set `deletedAt` instead of hard delete.
- Secrets (`JWT_*`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) never reach client bundles; only `NEXT_PUBLIC_*` is client-safe.
- Preserve resilience mechanisms: single-flight token refresh in `api-client.ts`, `P2034` retry, fire-and-forget audit logging.

## Styling & UX

- Tailwind 4 + `cn` from `@resto-hub/ui`; dark mode is the ONLY theme (wood/gold palette: bg `#0F0D0B/#1A1714/#252119`, gold `#C9A96E`, wood `#A87D44`).
- Use `@resto-hub/ui` primitives (Button, Dialog, Table, Skeleton, EmptyErrorState…) before building new ones.
- Mobile-first; web shows `MobileBottomNav` under `lg`.

## Naming & verification

- Files/folders `kebab-case`; components `PascalCase`; hooks `use-*.ts`; constants `UPPER_SNAKE_CASE`; Zod schemas `xxxSchema`; query keys `["entity", { filters }]`.
- Before finishing ANY change: `pnpm typecheck && pnpm lint && pnpm build` must pass. Conventional commit messages (commitlint enforced).
