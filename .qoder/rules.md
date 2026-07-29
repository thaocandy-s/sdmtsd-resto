# RESTO HUB — ENGINEERING RULES (Single Source of Truth)

> **MANDATORY**: Every implementation, review, refactor, or bug fix MUST begin by reading this file.
> If a requested change conflicts with these rules, the conflict MUST be explained BEFORE writing code.
> Companion doc: `.agents/AGENTS.md` (AI workflows). If they disagree, this file wins.
>
> **Auto-applied rules** (Qoder rule engine, front-matter `trigger`) live in `.qoder/rules/`:
> `core-standards.md` (always_on) · `admin-api.md`, `admin-dashboard-ui.md`, `web-public.md`, `db-and-packages.md` (glob-scoped).
> Those are condensed extracts of THIS file — when updating a standard, update this file AND the matching rule file.

**Detected stack** (rules below are tailored to exactly this):

| Layer       | Technology                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Monorepo    | Turborepo + pnpm workspaces (`pnpm@11.8.0`, Node `>=22`)                                          |
| Apps        | `apps/web` (Next.js 15 App Router, public, port 3000) · `apps/admin` (dashboard, port 3001)       |
| Packages    | `@resto-hub/ui` · `@resto-hub/utils` · `@resto-hub/types` · `@resto-hub/db` · `@resto-hub/config` |
| UI          | React 19, Tailwind CSS 4, Radix primitives + class-variance-authority, lucide-react, sonner       |
| Data        | Prisma 6 (`prisma-client-js`) → Supabase Postgres (multi-region KR/SEA/JP), Supabase Storage      |
| Admin state | TanStack Query v5 (server state) + Zustand (auth store) + react-hook-form + Zod                   |
| Web i18n    | next-intl — default locale `ja`, supported `ja`, `en`                                             |
| Auth        | Custom JWT: 15-min access token + 7-day HTTP-only `refreshToken` cookie                           |
| Deploy      | Vercel (functions pinned to `sin1`, matching SEA database), ISR for public pages                  |
| Quality     | ESLint 9 + Prettier 3, husky + lint-staged + commitlint (conventional commits)                    |

---

## 1. Architecture

### Folder structure (fixed — do not invent new top-level dirs)

```
apps/web/src/      app/[locale]/<feature>/ · app/api/ · i18n/ · lib/ · shared/components/
apps/admin/src/    app/(auth)/ · app/(dashboard)/<feature>/ · app/api/<resource>/ ·
                   lib/ · shared/{components,hooks,providers}/ · constants/
packages/ui/src/   components/ · lib/ · styles/       (shared primitives only)
packages/utils/src/ format/ · helpers/ · rate-limit/ · validation/
packages/types/src/ api/ · enums/ · models/
packages/db/src/   index.ts (Prisma singleton — the ONLY PrismaClient instantiation)
prisma/            schema.prisma · seed.ts            (single schema at repo root)
```

### Feature organization

- Each admin feature = one route dir under `app/(dashboard)/<feature>/` + matching API dir under `app/api/<resource>/`.
- Each web feature = one route dir under `app/[locale]/<feature>/`.
- Route-private components live in a co-located `_components/` dir. Promote to `src/shared/components/` when used by ≥2 features; promote to `@resto-hub/ui` when used by both apps and free of business logic.

### Layer boundaries & dependency direction

- Allowed direction only: `apps/*` → `packages/*` → `@resto-hub/config`. Never the reverse.
- `apps/web` MUST NEVER import from `apps/admin` and vice versa. Shared code goes to `packages/*`.
- `packages/ui` is presentational: Radix + Tailwind + CVA only. No data fetching, no Prisma, no business logic.
- All Prisma access goes through the singleton from `@resto-hub/db` (re-exported via app-local `lib/prisma.ts`). NEVER `new PrismaClient()` anywhere else.
- Internal deps use `"workspace:*"` specifiers.

### API layer

- Admin API routes: `apps/admin/src/app/api/<resource>/route.ts` (+ `[id]/route.ts`), always wrapped in `withAuth`/`withAuthParams` from `lib/auth.ts`.
- Admin client fetches: ONLY through the `api` helper in `apps/admin/src/lib/api-client.ts` (token-refresh-aware). Never raw `fetch` from admin client components.
- Web reads data directly via Prisma in Server Components (ISR); it does not call admin APIs.

### State management

- Admin: TanStack Query for all server state (see §3); Zustand only for the auth store (`use-auth-store.ts`). Do not add new global stores without justification — prefer query cache + local state.
- Web: no client global state library. Server Components + props; local `useState` for interactivity.
- Components stay stateless/presentational where possible; page-level containers own data and pass props down (established admin extraction pattern).

### Reuse before create (hard rule)

Before writing ANY helper, component, hook, type, or query: search `packages/ui`, `packages/utils`, `packages/types`, `lib/`, `shared/`. Extend existing code with optional props/params. Duplicating slugify/format/fetch-wrapper logic is forbidden.

---

## 2. TypeScript

- `strict: true` everywhere (from `@resto-hub/config` tsconfig base). Never weaken compiler options.
- **`any` is banned.** Use `unknown` + narrowing, generics, or Zod inference (`z.infer<typeof schema>`).
- No non-null `!` except for env vars that are fail-fast-validated elsewhere; prefer explicit guards (`getJwtSecret()` pattern: throw at startup if missing).
- Shared domain types live in `@resto-hub/types` (`models/`, `api/`, `enums/`). API request/response types must be imported, not redeclared inline.
- Derive types instead of re-typing: `Prisma.XGetPayload<...>`, `z.infer`, `Parameters<>`, `ReturnType<>`, `Pick`/`Omit`/`Partial`.
- Generics: constrain them (`<T extends { id: string }>`); no unconstrained `<T>` grab-bags.
- Exhaustive checking: `switch` over union types must end with a `never`-assert default (`const _exhaustive: never = value`).
- Type-safe API calls: `api.get<{ data: Restaurant | null }>("/api/info")` — always supply the envelope generic; the response envelope is `{ data: ... }` / `{ message: ... }`.
- Naming: types/interfaces `PascalCase` (no `I` prefix), enums from `packages/types/src/enums`, Zod schemas `xxxSchema`.

---

## 3. React / Next.js 15

### Server vs Client Components

- Default to Server Components. Add `"use client"` only for interactivity, hooks, browser APIs, TanStack Query, or react-hook-form.
- **Next.js 15: `params`/`searchParams` are Promises.** Always `await params` in pages, layouts, and route-handler contexts (`const { id } = await ctx.params`).
- Never pass raw Prisma objects (Date, Decimal, BigInt, Json) from Server → Client Components. Serialize to primitives/ISO strings first.
- Web public pages: `export const revalidate = 3600` (ISR), `generateStaticParams()` for locales, and `setRequestLocale(locale)` for static next-intl compilation.
- i18n hooks (`useTranslations`) must be called in client components positioned where the hook contract allows — never conditionally.

### Hooks & composition

- Custom hooks go in `apps/admin/src/shared/hooks/` (`use-*.ts`): follow existing patterns (`use-debounced-value`, `use-reorder`, `use-highlight-new`).
- Rules of hooks strictly: no conditional hooks, complete dependency arrays (ESLint enforced), cleanup functions for subscriptions/timers.
- Compose small components; pages assemble feature components from `_components/`; avoid 300+ line monolith components — extract.

### TanStack Query (admin)

- Query keys: array with entity + filter object — `["contacts", { status }]`. Keep keys consistent for targeted invalidation.
- Mutations: `useMutation` + `queryClient.invalidateQueries({ queryKey: [...] })` on success + `sonner` toast feedback. Surface API errors to the user — never swallow.
- No `useEffect`-based fetching in admin. Server state = TanStack Query, always.

### Performance in components

- Memoize expensive computations (`useMemo`), stable callbacks passed to memoized children (`useCallback`), `React.memo` only for measured hot paths (tables, sortable lists, chart wrappers).
- Lazy-load heavy client-only widgets (Chart.js, dnd-kit boards) via `next/dynamic` with `ssr: false` where appropriate, paired with a `Skeleton` fallback.
- Use `<Suspense>` boundaries with skeleton fallbacks for slow server segments; use `loading.tsx` for route-level loading.

---

## 4. Styling

- **Tailwind CSS 4** utilities only; shared theme from `@resto-hub/config/tailwind`. No CSS modules, no styled-components, no inline style objects except dynamic values (e.g., computed widths).
- Class merging exclusively via `cn` from `@resto-hub/ui`. Variant components use class-variance-authority (see `button.tsx`).
- **Design tokens (do not deviate):** backgrounds `#0F0D0B` / `#1A1714` / `#252119`; accents gold `#C9A96E`, wood `#A87D44`; borders `#3A3228` / `#4D4235`; fonts Inter + Noto Sans JP; gradients `gold-gradient`, `wood-pattern`.
- **Dark mode is the default and only theme** (`className="dark"` on `<html>`). Do not introduce a light theme or theme toggles.
- Mobile-first: write base styles for mobile, layer `sm:`/`md:`/`lg:` up. Web must render `MobileBottomNav` below `lg` and desktop header/side nav at `lg+`.
- Required-field indicators use the single established color convention — check existing forms before styling new ones.
- Custom scrollbars follow the existing webkit pattern (6px, border colors, gold hover). Transitions on hover/focus/state; new items flash with `.animate-highlight-flash`.

---

## 5. UI / UX

- Use `@resto-hub/ui` primitives (Button, Input, Card, Table, Dialog, Tabs, Badge, Skeleton, Pagination, EmptyErrorState, Toaster…) before building anything new.
- **Loading states**: `Skeleton` components matching final layout — never spinners-only, never layout shift.
- **Empty & error states**: use `EmptyErrorState` from `@resto-hub/ui` with an actionable message (and retry where relevant).
- **Forms (admin)**: react-hook-form + `@hookform/resolvers` + Zod schema. Inline field errors via `FormError`/field messages; required fields marked in the UI; submit buttons disabled while pending; server errors surfaced via toast AND inline where field-specific.
- **Tables**: `@resto-hub/ui` Table + Pagination; filters via query-key objects; sortable lists use dnd-kit through the shared `sortable-list.tsx` + `use-reorder` hook.
- **Dialogs**: Radix Dialog/AlertDialog only. Destructive actions require `confirm-modal.tsx` confirmation. Never `window.confirm`.
- **Feedback**: every mutation shows a `sonner` toast (success and failure).
- Mobile usability: touch targets ≥44px, no hover-only affordances, test dashboards and web at 375px width.

---

## 6. API

- Route handlers follow the fixed shape: `withAuth({ module, action })(handler)` → Zod `safeParse` body → Prisma → `NextResponse.json({ data })`.
- Response envelope contract (NEVER change silently): success `{ data: ... }`, error `{ message: string }` (+ validation detail list on 400). Status codes: 400 validation, 401 unauthenticated, 403 unauthorized, 404 missing, 500 with generic message.
- All handler bodies wrapped in try/catch; 500s log `console.error` server-side but return generic messages (no stack traces, no Prisma error leakage).
- Validation with Zod `safeParse` on EVERY body/query input — reject before touching the database.
- Client retry policy: TanStack Query defaults handle read retries; mutations are NOT auto-retried (avoid double-writes). The `api` client handles 401 → single-flight token refresh (`refreshPromise`/`isRefreshing` lock) — preserve this mechanism exactly.
- Cancellation: pass TanStack Query's `signal` to fetches for filterable/searchable lists so stale requests abort.
- Rate limit brute-forceable endpoints (`/api/auth/login`, public contact/reservation POSTs) with the Map-based `rateLimit` helper + `getClientIpFromHeaders` (first `x-forwarded-for` entry, fallback `x-real-ip`).
- Ordering mutations use `createOrdered`/`updateOrdered`/`runOrderingTransaction` from `lib/ordering.ts` — never hand-roll `sortOrder` math.

---

## 7. Supabase & Database

- **Access pattern**: Prisma is the data API (via `@resto-hub/db` singleton). `@supabase/supabase-js` is used ONLY for Storage (`supabaseAdmin` with service-role key, server-side only). Do not use supabase-js for table queries; do not add Realtime subscriptions without an explicit decision.
- **Multi-region**: KR/SEA/JP Supabase projects; env switching is comment-based in `.env`. Production = SEA (`sin1` Vercel region). Never hardcode a region URL; always read env.
- **RLS**: enforced globally on Supabase. Server-side Prisma/service-role access bypasses it — therefore EVERY admin route must enforce authz via `withAuth` + `authorize(user, module, action)`. Never assume RLS protects admin APIs.
- **Storage**: bucket `media` (must exist per regional project). Upload paths via `buildStoragePath()`; deletion via `deleteMediaByUrl()` (removes storage object + `Media` row together). Never orphan either side.
- **Query practices**:
  - Always `select` only needed fields for list endpoints; use `include` deliberately, never nested-include everything.
  - Pagination: `take`/`skip` (or explicit `limit` param) on all list queries; no unbounded `findMany` on growing tables.
  - Soft delete: models with `deletedAt` MUST filter `deletedAt: null` in every read; deletes set `deletedAt`, never hard-delete (except explicitly hard-deleted entities like Media).
  - Add `@@index` for new filter/sort columns (follow `@@index([isActive, sortOrder])` pattern).
  - Connection pool: `buildDatasourceUrl` pins `connection_limit=10`, `pool_timeout=30` — do not override.
  - Serializable transaction conflicts (`P2034`): retry up to 2× via `runOrderingTransaction`.
- **Optimistic updates**: only for reorder (dnd-kit) interactions — apply locally, persist via `use-reorder`, roll back + toast on failure. Everything else: invalidate-and-refetch.
- **Schema changes**: edit `prisma/schema.prisma` → `pnpm db:generate` → migrate/push → update `@resto-hub/types` → seed if needed.

---

## 8. Performance

- Public web pages: ISR (`revalidate = 3600`) + `generateStaticParams`. Never make a public page fully dynamic without justification.
- Images: `next/image` with explicit `width`/`height` or `fill` + `sizes`; hero banners use `priority`; Supabase Storage URLs configured in `next.config` image domains.
- Bundle: no new heavy dependencies without checking size; charts and drag-and-drop stay admin-only and dynamically imported; never import server-only modules (Prisma, jsonwebtoken, bcryptjs) into client components.
- Avoid re-render storms: don't create new object/array/lambda props inline for memoized children; split contexts/providers (`query-provider`, `auth-provider`) as already done.
- DB: fix N+1 with `include`/batched queries; aggregate with `groupBy`/`count` instead of fetching rows to count in JS.
- Caching: rely on Next.js fetch/route caching semantics deliberately — Server Components that must be fresh in admin are dynamic; public web relies on ISR windows.

---

## 9. Security

- **Auth**: 15-min JWT access tokens (Authorization: Bearer), 7-day refresh token in HTTP-only, `sameSite: strict`, secure-in-prod cookie. Fail fast if `JWT_SECRET`/`JWT_REFRESH_SECRET` unset. Refresh tokens are DB-tracked (`RefreshToken`) and revocable.
- **Authorization**: `authorize(user, module, action)` on every admin route; `ADMIN` role bypasses; others need `module:action` permission. Never expose an unwrapped mutating route.
- Passwords: bcryptjs only; never log or return `passwordHash`.
- Input validation: Zod on all inputs (bodies, query params, route params). SQL injection is prevented by staying on the Prisma API — `$queryRawUnsafe` is banned; parameterized `$queryRaw` only with review.
- XSS: React escaping by default; `dangerouslySetInnerHTML` only for the JSON-LD helper (`jsonld.tsx`) with server-controlled content. Sanitize/validate all URLs stored via admin (cta links, social links).
- Secrets: server-only env vars (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_*`, `DATABASE_URL`) must never appear in client bundles — only `NEXT_PUBLIC_*` is client-safe. Never commit `.env*`; update `.env.example` when adding variables.
- Audit: mutating admin operations write `AuditLog` fire-and-forget (`.catch(console.error)`) — never let audit failure fail the request, and never remove auditing when refactoring.
- Rate limit auth + public write endpoints (see §6).

---

## 10. SEO (apps/web only)

- Metadata via App Router `metadata`/`generateMetadata` with the global template `{ default: "Resto Hub", template: "%s | Resto Hub" }`; per-page localized titles/descriptions.
- JSON-LD structured data (Restaurant schema: hours, geo, address) via the existing `lib/jsonld.tsx` helper in layouts.
- `app/sitemap.ts` and `app/robots.ts` are the source of truth — register new public routes in the sitemap.
- Locale handling: `hreflang`/alternates for `ja`/`en`; canonical URLs point to the production domain; middleware handles locale matching and MUST keep bypassing `/admin` and `/api`.
- Open Graph: `openGraph` metadata with image per shareable page.
- Admin app: `robots: noindex` — never index the dashboard.

---

## 11. Accessibility

- Radix primitives handle focus trapping, ARIA, and keyboard nav — use them; never rebuild dialogs/dropdowns/tabs/switches from divs.
- Every interactive element keyboard-reachable and operable (Enter/Space); dnd-kit lists keep keyboard sensor support.
- Never remove focus outlines without an equally visible replacement ring (gold accent acceptable).
- Semantic HTML5 landmarks (`main`, `nav`, `header`, `footer`, `section`); heading levels sequential.
- Images require meaningful `alt` (empty `alt=""` for decorative). Icon-only buttons require `aria-label`.
- Color contrast: verify gold-on-dark text meets WCAG AA (≥4.5:1 body, ≥3:1 large text) — the dark palette makes low-contrast grays a recurring risk.
- Forms: `Label` linked to inputs (`htmlFor`), errors announced (associate via `aria-describedby`).

---

## 12. Error Handling

- API: try/catch every handler; `{ message }` envelope; generic 500 text; `console.error` server-side with context prefix (e.g., `"deleteMediaByUrl error:"`).
- Client (admin): TanStack Query `error` states render inline (`EmptyErrorState`/`FormError`) AND mutations toast failures. Silent failures are forbidden.
- Route-level: provide `error.tsx` and `not-found.tsx` boundaries for user-facing segments (web already has localized `not-found.tsx`).
- Resilience boundaries to preserve: fire-and-forget audit logging, `P2034` retry loop, single-flight token refresh, `deleteMediaByUrl` best-effort storage cleanup.
- User-facing messages: localized (web) / human-readable (admin); never expose stack traces, Prisma codes, or SQL to users.

---

## 13. Naming Conventions

| Item                 | Convention                            | Example                                   |
| -------------------- | ------------------------------------- | ----------------------------------------- |
| Files & folders      | `kebab-case`                          | `image-upload.tsx`, `home-management/`    |
| Route-private dirs   | `_components/`                        | `app/(dashboard)/faq/_components/`        |
| Components           | `PascalCase` export, kebab-case file  | `export function ImageUpload`             |
| Hooks                | `use-*.ts` file, `useX` export        | `use-reorder.ts` → `useReorder`           |
| Functions/variables  | `camelCase`, verbs for functions      | `buildStoragePath`, `filterStatus`        |
| Constants            | `UPPER_SNAKE_CASE`                    | `MEDIA_BUCKET`, `MUTATION_METHODS`        |
| Types/interfaces     | `PascalCase`, no `I` prefix           | `AuthUser`, `WithAuthOptions`             |
| Zod schemas          | `camelCase` + `Schema` suffix         | `createEventSchema`                       |
| Query keys           | `["entity", { filters }]`             | `["contacts", { status }]`                |
| Prisma models/fields | `PascalCase` model, `camelCase` field | `HeroBanner.sortOrder`                    |
| API routes           | plural/domain resource dirs           | `/api/banners`, `/api/reservations`       |
| Branches/commits     | Conventional Commits (commitlint)     | `feat(admin): add buffet category filter` |

---

## 14. Testing Strategy

> Current state: no test runner is configured. The verification gate is `typecheck` + `lint` + `build`. When tests are introduced, follow this plan; do not add a test framework as a side effect of another task.

- **Unit (Vitest when adopted)**: pure logic first — `packages/utils` (format, validation, rate-limit), `lib/ordering.ts`, Zod schemas, `buildStoragePath`.
- **Integration**: admin API route handlers with a test database — auth wrapper behavior (401/403), validation (400), soft-delete filtering, ordering transactions.
- **E2E (Playwright recommended)** critical paths: admin login → refresh-token flow; CRUD + reorder for one menu entity; media upload/delete; public web locale routing + menu render; reservation/contact submission with rate limit.
- Every bug fix on testable pure logic should add a regression test once the runner exists.
- Until then, MANDATORY verification for every change: `pnpm typecheck && pnpm lint && pnpm build` clean across the workspace.

---

## 15. Mandatory Checklists

### Pre-Coding Checklist

- [ ] Read `.qoder/rules.md` (this file).
- [ ] Identified affected surfaces: `apps/web` / `apps/admin` / `packages/*` / `prisma/`.
- [ ] Searched for existing components/utils/hooks/types/queries to reuse or extend.
- [ ] Confirmed layer boundaries: no cross-app imports, shared code targeted at the right package.
- [ ] For schema work: planned migration + `db:generate` + type updates + soft-delete/index implications.
- [ ] Any conflict with these rules surfaced to the user BEFORE coding.

### Pre-Commit Checklist

- [ ] `pnpm typecheck` clean (all workspaces).
- [ ] `pnpm lint` — zero errors/warnings.
- [ ] `pnpm build` succeeds (Turborepo, both apps).
- [ ] No `any`, no leftover `console.log` (server `console.error` with context prefix is allowed).
- [ ] No secrets/env values in code; `.env.example` updated if new vars added.
- [ ] Conventional commit message (commitlint will reject otherwise).
- [ ] Prettier formatting applied (lint-staged runs it, but don't rely on it to fix structure).

### Code Review Checklist

- [ ] API contract unchanged (envelope `{ data }` / `{ message }`, status codes) unless explicitly requested.
- [ ] All new endpoints wrapped in `withAuth`/`withAuthParams` with correct `module:action`.
- [ ] Zod validation on all new inputs; soft-delete filters on all new reads.
- [ ] Server/Client component split correct; `params` awaited (Next 15); no Prisma objects crossing to client.
- [ ] TanStack Query keys consistent; invalidation covers all affected lists; errors surfaced to user.
- [ ] Reused shared primitives; no duplicated helpers; new shared code placed in the right package.
- [ ] Dark wood/gold theme, i18n strings (web), and existing UX patterns preserved.

### Refactoring Safety Rules

- [ ] Preserve: business logic, API contracts, DB behavior (cascades, soft deletes, defaults), `withAuth` coverage, middleware locale bypasses (`/admin`), ISR settings, pooled connection config.
- [ ] Preserve resilience mechanisms: single-flight token refresh, `P2034` retries, fire-and-forget audit logging.
- [ ] No behavior change unless the task explicitly asks for it; flag any unavoidable change before implementing.
- [ ] Verify all import sites after moving code (`grep` the old path); run full typecheck + build.

### Performance Checklist

- [ ] Public pages keep ISR + static params; no accidental dynamic rendering.
- [ ] List queries select minimal fields and are paginated; new filter/sort columns indexed.
- [ ] No N+1 queries; aggregates use Prisma aggregation.
- [ ] Heavy client libs dynamically imported; no server-only modules in client bundles.
- [ ] `next/image` used with sizing; no unoptimized `<img>`.
- [ ] No new re-render sources in hot components (inline lambdas/objects into memoized children).

### Security Checklist

- [ ] Every mutating route authenticated + authorized (`module:action`).
- [ ] All inputs Zod-validated; no `$queryRawUnsafe`; no string-built queries.
- [ ] No service-role key, JWT secret, or `DATABASE_URL` reachable from client code.
- [ ] Refresh-token cookie flags intact (httpOnly, sameSite strict, secure in prod).
- [ ] Rate limiting on auth/public write endpoints.
- [ ] Audit logging present on admin mutations; no sensitive data (passwords, tokens) in logs or responses.

### Mobile Checklist

- [ ] Layout verified at 375px, 768px, 1280px.
- [ ] Web shows `MobileBottomNav` under `lg`; desktop nav at `lg+`.
- [ ] Touch targets ≥44px; no hover-only interactions; tables scroll or stack gracefully.
- [ ] Forms usable on mobile keyboards (correct `type`/`inputMode`).

### Accessibility Checklist

- [ ] Radix primitives used for overlays/menus/tabs; no div-based dialogs.
- [ ] Full keyboard operability; visible focus rings everywhere.
- [ ] Labels linked to inputs; errors associated via `aria-describedby`; icon buttons have `aria-label`.
- [ ] `alt` text on images; semantic landmarks; sequential headings.
- [ ] Gold/gray-on-dark contrast meets WCAG AA.

---

_Last analyzed: full repository audit of the Turborepo monorepo (apps/web, apps/admin, packages/ui|utils|types|db|config, prisma). Update this file FIRST whenever architecture, packages, or conventions change._
