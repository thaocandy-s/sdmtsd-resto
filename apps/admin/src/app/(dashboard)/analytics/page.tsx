"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AnalyticsOverview, AnalyticsTopItem, DailyPoint } from "./_components/types";
import { AnalyticsSummaryCards } from "./_components/AnalyticsSummaryCards";
import { DailyTrendChart } from "./_components/DailyTrendChart";
import { TopItemsList } from "./_components/TopItemsList";

// Period options — kept short and non-technical for restaurant owners
const PERIODS = [7, 30, 90] as const;

// One query per widget — each endpoint stays small and independently cacheable
function useAnalyticsQuery<T>(section: string, days: number) {
  return useQuery({
    queryKey: ["analytics", section, { days }],
    queryFn: () => api.get<{ data: T }>(`/api/analytics/${section}?days=${days}`),
    placeholderData: keepPreviousData,
  });
}

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [days, setDays] = useState<number>(30);

  const overviewQuery = useAnalyticsQuery<AnalyticsOverview>("overview", days);
  const dailyQuery = useAnalyticsQuery<{ daily: DailyPoint[] }>("daily", days);
  const topCategoriesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>(
    "top-categories",
    days
  );
  const topDishesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>("top-dishes", days);
  const topCountriesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>("top-countries", days);

  const periodLabel = (d: number) => t(`last${d}Days`);

  if (overviewQuery.isPending) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* HEADER WITH PERIOD SELECTOR */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-background-secondary p-1 self-start">
          {PERIODS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                days === d
                  ? "bg-gold-500 text-background font-medium"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              {periodLabel(d)}
            </button>
          ))}
        </div>
      </header>

      {/* SECTION 1 — OVERVIEW CARDS */}
      <AnalyticsSummaryCards overview={overviewQuery.data?.data} />

      {/* SECTION 2 — TRAFFIC TREND (single line chart, daily visitors) */}
      <DailyTrendChart dailyData={dailyQuery.data?.data.daily} />

      {/* SECTIONS 3 & 4 — TOP CATEGORIES / TOP DISHES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopItemsList title={t("topCategories")} items={topCategoriesQuery.data?.data.items} />
        <TopItemsList title={t("topDishes")} items={topDishesQuery.data?.data.items} />
      </div>

      {/* SECTION 5 — VISITORS BY COUNTRY */}
      <div className="mb-8">
        <TopItemsList
          title={t("topCountries")}
          items={topCountriesQuery.data?.data.items}
          isCountryList
        />
      </div>
    </>
  );
}
