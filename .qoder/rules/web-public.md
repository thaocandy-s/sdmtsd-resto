---
trigger: glob
globs: apps/web/**
---

# RestoHub — Public Web App Rules

Applies to `apps/web` (customer-facing, Next.js 15, next-intl, ISR).

## Rendering & i18n

- Public pages are ISR: `export const revalidate = 3600;` + `generateStaticParams()` for locales `ja` (default) and `en` + `setRequestLocale(locale)` for static next-intl compilation. Never make a public page fully dynamic without justification.
- All visible strings from `src/i18n/messages/{locale}.json` — no hardcoded text. i18n hooks never called conditionally.
- Data is read directly via Prisma in Server Components (from `@/lib/prisma`) — web does NOT call admin APIs. Serialize Prisma objects before passing to Client Components.
- No client global state library; Server Components + props, local `useState` only for interactivity.

## SEO

- Metadata via `metadata`/`generateMetadata`, global template `%s | Resto Hub`; localized titles/descriptions; Open Graph image per shareable page.
- JSON-LD (Restaurant schema) via the existing `lib/jsonld.tsx` helper — the only allowed `dangerouslySetInnerHTML` usage.
- New public routes MUST be registered in `app/sitemap.ts`; `robots.ts` is the source of truth.
- Middleware locale matching MUST keep bypassing `/admin` and `/api`.

## UI

- Dark wood/gold theme only; mobile-first Tailwind; `MobileBottomNav` under `lg`, desktop header/side nav at `lg+`.
- `next/image` with explicit sizing (`width/height` or `fill`+`sizes`); hero banners `priority`.
- Animations: framer-motion / embla-carousel per existing patterns; smooth hover/focus transitions; touch targets ≥44px, no hover-only affordances.
- Phone-call buttons follow the established lucide-react pattern used across pages.
- Semantic HTML5 landmarks, sequential headings, meaningful `alt`, visible focus rings (gold accent acceptable).
