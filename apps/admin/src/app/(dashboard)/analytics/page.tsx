"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AnalyticsOverview, AnalyticsTopItem, DailyPoint } from "./_components/types";
import { AnalyticsSummaryCards } from "./_components/AnalyticsSummaryCards";
import { DailyTrendChart } from "./_components/DailyTrendChart";
import { TopItemsList } from "./_components/TopItemsList";
import { DailyVisitorsTable } from "./_components/DailyVisitorsTable";

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
  const [days, setDays] = useState(30);

  const overviewQuery = useAnalyticsQuery<AnalyticsOverview>("overview", days);
  const dailyQuery = useAnalyticsQuery<{ daily: DailyPoint[] }>("daily", days);
  const topCategoriesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>(
    "top-categories",
    days
  );
  const topDishesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>("top-dishes", days);
  const topCountriesQuery = useAnalyticsQuery<{ items: AnalyticsTopItem[] }>("top-countries", days);

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
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value={7}>{t("last7Days")}</option>
          <option value={30}>{t("last30Days")}</option>
          <option value={90}>{t("last90Days")}</option>
          <option value={365}>{t("last365Days")}</option>
        </select>
      </header>

      {/* SUMMARY CARDS */}
      <AnalyticsSummaryCards overview={overviewQuery.data?.data} />

      {/* DAILY TREND CHART */}
      <DailyTrendChart dailyData={dailyQuery.data?.data.daily} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* TOP VIEWED CATEGORIES */}
        <TopItemsList title={t("topCategories")} items={topCategoriesQuery.data?.data.items} />

        {/* TOP VIEWED DISHES */}
        <TopItemsList title={t("topDishes")} items={topDishesQuery.data?.data.items} />

        {/* VISITORS BY COUNTRY */}
        <TopItemsList
          title={t("topCountries")}
          items={topCountriesQuery.data?.data.items}
          isCountryList
        />

        {/* DAILY VISITORS TABLE */}
        <DailyVisitorsTable dailyData={dailyQuery.data?.data.daily} />
      </div>
    </>
  );
}
