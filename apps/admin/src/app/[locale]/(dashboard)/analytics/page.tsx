"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { AnalyticsData } from "./_components/types";
import { AnalyticsSummaryCards } from "./_components/AnalyticsSummaryCards";
import { DailyTrendChart } from "./_components/DailyTrendChart";
import { SectionBreakdownList } from "./_components/SectionBreakdownList";
import { DailyVisitorsTable } from "./_components/DailyVisitorsTable";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AnalyticsData }>(`/api/analytics?days=${days}`);
      setData(res.data);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <AnalyticsSummaryCards summary={data?.summary} />

      {/* DAILY TREND CHART */}
      <DailyTrendChart dailyData={data?.dailyData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SECTION BREAKDOWN */}
        <SectionBreakdownList sectionBreakdown={data?.sectionBreakdown} />

        {/* DAILY VISITORS TABLE */}
        <DailyVisitorsTable dailyData={data?.dailyData} />
      </div>
    </>
  );
}
