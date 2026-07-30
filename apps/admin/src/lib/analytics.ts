import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyticsEntityType, AnalyticsTopItem } from "@resto-hub/types";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// Analytics aggregation helpers.
//
// analytics_daily is the primary table for dashboard reads: visitors/pageViews
// are incremented in real time by the web track endpoint, while the JSON
// top-lists are recomputed here from raw analytics_events (kept 90 days).
// The rollup recomputes recent days idempotently, so a missed cron run
// self-heals on the next one.

export const TOP_LIST_SIZE = 10;
export const EVENT_RETENTION_DAYS = 90;
// Recompute the last N days on each rollup run (covers missed cron runs)
const ROLLUP_LOOKBACK_DAYS = 3;

export type TopListField = "topCategories" | "topDishes" | "topCountries";

// Query period in days; defaults to 30 when absent, null when invalid (→ 400)
const daysSchema = z.coerce.number().int().min(1).max(365);

export function parseDays(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("days");
  if (raw === null) return 30;
  const parsed = daysSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function startOfUtcDay(date: Date): Date {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

// Resolve display names for grouped slugs; falls back to the slug itself
async function resolveNames(
  entityType: AnalyticsEntityType,
  slugs: string[],
  kind: "category" | "dish"
): Promise<Map<string, string>> {
  if (slugs.length === 0) return new Map();

  const where = { slug: { in: slugs } };
  const select = { slug: true, name: true };

  let rows: { slug: string; name: string }[] = [];
  if (kind === "category") {
    rows =
      entityType === "menu"
        ? await prisma.foodCategory.findMany({ where, select })
        : entityType === "drink"
          ? await prisma.drinkCategory.findMany({ where, select })
          : [];
  } else {
    rows =
      entityType === "menu"
        ? await prisma.food.findMany({ where, select })
        : entityType === "drink"
          ? await prisma.drink.findMany({ where, select })
          : await prisma.buffetCourse.findMany({ where, select });
  }

  return new Map(rows.map((row) => [row.slug, row.name]));
}

// Top viewed categories/dishes for a time range, computed from raw events
async function computeTopEntities(
  event: "view_category" | "view_dish",
  start: Date,
  end: Date
): Promise<AnalyticsTopItem[]> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["entityType", "slug"],
    where: {
      event,
      createdAt: { gte: start, lt: end },
      entityType: { not: null },
      slug: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: TOP_LIST_SIZE,
  });

  // Resolve display names per entity type (canonical, locale-independent)
  const kind = event === "view_category" ? "category" : "dish";
  const types = [...new Set(grouped.map((g) => g.entityType as AnalyticsEntityType))];
  const nameMaps = new Map<string, Map<string, string>>();
  for (const type of types) {
    const slugs = grouped.filter((g) => g.entityType === type).map((g) => g.slug as string);
    nameMaps.set(type, await resolveNames(type, slugs, kind));
  }

  return grouped.map((g) => ({
    key: `${g.entityType}:${g.slug}`,
    name: nameMaps.get(g.entityType as string)?.get(g.slug as string) ?? (g.slug as string),
    count: g._count._all,
  }));
}

// Visitors by country for a time range (new-visitor events only)
async function computeTopCountries(start: Date, end: Date): Promise<AnalyticsTopItem[]> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["country"],
    where: {
      isNewVisitor: true,
      country: { not: null },
      createdAt: { gte: start, lt: end },
    },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: TOP_LIST_SIZE,
  });

  return grouped.map((g) => ({
    key: g.country as string,
    name: g.country as string,
    count: g._count._all,
  }));
}

const TOP_LIST_COMPUTERS: Record<
  TopListField,
  (start: Date, end: Date) => Promise<AnalyticsTopItem[]>
> = {
  topCategories: (start, end) => computeTopEntities("view_category", start, end),
  topDishes: (start, end) => computeTopEntities("view_dish", start, end),
  topCountries: computeTopCountries,
};

// Merge per-day top lists by key, summing counts, and keep the overall top N
export function mergeTopItems(
  lists: AnalyticsTopItem[][],
  limit = TOP_LIST_SIZE
): AnalyticsTopItem[] {
  const merged = new Map<string, AnalyticsTopItem>();
  for (const list of lists) {
    for (const item of list) {
      const existing = merged.get(item.key);
      if (existing) {
        existing.count += item.count;
      } else {
        merged.set(item.key, { ...item });
      }
    }
  }
  return [...merged.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

// Recompute one day's analytics_daily row from raw events (idempotent).
// Counters are recomputed too so raw events stay the single source of truth
// for finalized days; only runs within the 90-day raw retention window.
export async function rollupDay(dayStart: Date): Promise<void> {
  const dayEnd = addDays(dayStart, 1);
  const range = { gte: dayStart, lt: dayEnd };

  const [pageViews, visitors, topCategories, topDishes, topCountries] = await Promise.all([
    prisma.analyticsEvent.count({ where: { event: { not: "view_category" }, createdAt: range } }),
    prisma.analyticsEvent.count({ where: { isNewVisitor: true, createdAt: range } }),
    TOP_LIST_COMPUTERS.topCategories(dayStart, dayEnd),
    TOP_LIST_COMPUTERS.topDishes(dayStart, dayEnd),
    TOP_LIST_COMPUTERS.topCountries(dayStart, dayEnd),
  ]);

  // Days without any events don't need a row
  if (pageViews === 0 && visitors === 0) return;

  const data = {
    visitors,
    pageViews,
    topCategories: topCategories as unknown as Prisma.InputJsonValue,
    topDishes: topDishes as unknown as Prisma.InputJsonValue,
    topCountries: topCountries as unknown as Prisma.InputJsonValue,
  };

  await prisma.analyticsDaily.upsert({
    where: { date: dayStart },
    create: { date: dayStart, ...data },
    update: data,
  });
}

// Delete raw events past the retention window
export async function cleanupOldEvents(): Promise<number> {
  const cutoff = addDays(startOfUtcDay(new Date()), -EVENT_RETENTION_DAYS);
  const result = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return result.count;
}

// Full rollup pass: recompute recent days + enforce raw-event retention
export async function runRollup(): Promise<{ rolledUpDays: string[]; deletedEvents: number }> {
  const today = startOfUtcDay(new Date());
  const rolledUpDays: string[] = [];

  for (let offset = ROLLUP_LOOKBACK_DAYS - 1; offset >= 0; offset--) {
    const day = addDays(today, -offset);
    await rollupDay(day);
    rolledUpDays.push(day.toISOString().slice(0, 10));
  }

  const deletedEvents = await cleanupOldEvents();
  return { rolledUpDays, deletedEvents };
}

// Top list for the dashboard: finalized days come from analytics_daily,
// today is aggregated live from raw events so the dashboard stays fresh.
export async function getTopItems(field: TopListField, days: number): Promise<AnalyticsTopItem[]> {
  const today = startOfUtcDay(new Date());
  const start = addDays(today, -(days - 1));

  const dailyRows = await prisma.analyticsDaily.findMany({
    where: { date: { gte: start, lt: today } },
    select: { topCategories: true, topDishes: true, topCountries: true },
  });

  const pastLists = dailyRows.map((row) => (row[field] ?? []) as unknown as AnalyticsTopItem[]);
  const todayList = await TOP_LIST_COMPUTERS[field](today, addDays(today, 1));

  return mergeTopItems([...pastLists, todayList]);
}

// Shared GET handler for the three top-list endpoints — keeps routes thin
// and makes adding a new top-list metric a one-liner.
export function createTopListRoute(field: TopListField) {
  return withAuth(
    async (request: NextRequest) => {
      try {
        const days = parseDays(new URL(request.url).searchParams);
        if (days === null) {
          return NextResponse.json({ message: "Invalid days parameter" }, { status: 400 });
        }

        const items = await getTopItems(field, days);
        return NextResponse.json({ data: { items } });
      } catch (error) {
        console.error(`Get ${field} error:`, error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
      }
    },
    { module: "analytics", action: "read" }
  );
}
