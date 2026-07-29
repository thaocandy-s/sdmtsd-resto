---
trigger: glob
globs: prisma/**,packages/db/**,packages/types/**,packages/utils/**,packages/ui/**
---

# RestoHub — Database & Shared Packages Rules

Applies to `prisma/`, `packages/db`, `packages/types`, `packages/utils`, `packages/ui`.

## Prisma schema (`prisma/schema.prisma` — single schema at repo root)

- Models `PascalCase`, fields `camelCase`; `id String @id @default(uuid())`; timestamps `createdAt @default(now())` + `updatedAt @updatedAt`.
- Soft delete via nullable `deletedAt DateTime?` — follow existing models; consumers must filter `deletedAt: null`.
- Manual ordering via `sortOrder Int @default(0)`; index filter/sort combos like `@@index([isActive, sortOrder])`.
- Relations declare explicit `onDelete` behavior; preserve existing cascades and defaults when refactoring.
- Workflow after schema change: `pnpm db:generate` → migrate/push (`db:migrate`/`db:push`) → update `@resto-hub/types` → adjust `prisma/seed.ts` if needed.

## packages/db

- The ONLY place `PrismaClient` is instantiated (globalThis singleton). Do not override `buildDatasourceUrl` pool settings (`connection_limit=10`, `pool_timeout=30`) — they prevent P2024 starvation on Vercel builds.

## packages/types

- Shared domain/API/enum types live here (`models/`, `api/`, `enums/`). API request/response shapes are imported by both the route handler and the client — never redeclared inline.
- `PascalCase` types, no `I` prefix; prefer deriving from Prisma payloads and `z.infer` over duplicating shapes.

## packages/utils

- Pure, framework-free helpers only (format, validation, rate-limit, helpers). No React, no Prisma, no Next.js imports.
- Zod schemas named `xxxSchema`; extend existing validation/format helpers instead of duplicating (slugify, price/date formatting, IP extraction).

## packages/ui

- Presentational primitives only: Radix + Tailwind 4 + class-variance-authority + `cn`. No data fetching, no business logic, no app-specific text.
- New variants extend existing CVA components (see `button.tsx`) rather than forking; keep Radix a11y wiring (focus trap, ARIA) intact.
- A component belongs here only when used by BOTH apps; otherwise keep it in the app's `shared/components/`.
