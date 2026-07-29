---
trigger: glob
globs: apps/admin/src/app/(dashboard)/**,apps/admin/src/shared/**
---

# RestoHub — Admin Dashboard UI Rules

Applies to admin dashboard pages, `_components/`, and `src/shared/`.

## Data fetching (client)

- ALL server state via TanStack Query v5 — never `useEffect` fetching.
- ALL requests via the `api` helper from `@/lib/api-client.ts` (token-refresh-aware, single-flight `refreshPromise`) — never raw `fetch`. Always type the envelope: `api.get<{ data: T }>(...)`.
- Query keys: `["entity", { filters }]` (e.g. `["contacts", { status }]`). Mutations invalidate all affected keys on success.
- Pass TanStack Query's `signal` to fetches for filterable/searchable lists.
- Mutations are NOT auto-retried; every mutation shows a `sonner` toast (success AND failure). Silent failures are forbidden.

## Forms

- react-hook-form + `@hookform/resolvers` + Zod schema (reuse schemas from `packages/utils/src/validation` or `lib/validation.ts` when possible).
- Inline field errors (`FormError`), required-field markers per the established color convention, submit disabled while pending, server errors surfaced via toast AND inline where field-specific.

## Components

- Route-private components in `_components/`; promote to `src/shared/components/` at ≥2 features; promote to `@resto-hub/ui` only if used by both apps and business-logic-free.
- Components stay stateless/presentational; page-level containers own data and pass props down.
- Reorderable lists: dnd-kit via shared `sortable-list.tsx` + `use-reorder` hook (optimistic update, rollback + toast on failure).
- Destructive actions require `confirm-modal.tsx` — never `window.confirm`.
- Loading = `Skeleton` matching final layout; empty/error = `EmptyErrorState`.
- Heavy client libs (Chart.js, dnd-kit boards) loaded with `next/dynamic` + Skeleton fallback.
- Custom hooks in `src/shared/hooks/` as `use-*.ts`; global state only in the existing Zustand auth store — no new global stores without justification.
