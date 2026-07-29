"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DashboardStatsGrid } from "./_components/DashboardStatsGrid";
import { DashboardPageViews } from "./_components/DashboardPageViews";
import { PopularFoodsWidget } from "./_components/PopularFoodsWidget";

interface DashboardStats {
  totalFoods: number;
  totalDrinks: number;
  totalBuffets: number;
  totalReservations: number;
  pendingReservations: number;
  totalContacts: number;
  unreadContacts: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  weekPageViews: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
}

interface Food {
  id: string;
  name: string;
  price: number;
  isPopular: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  popularFoods: Food[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<{ data: DashboardData }>("/api/dashboard/stats"),
  });

  const data = dashboardQuery.data?.data ?? null;
  const loading = dashboardQuery.isPending;

  if (loading) {
    return (
      <>
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("loading")}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/2 mb-2" />
              <div className="h-8 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("welcome")}</p>
      </header>

      <DashboardStatsGrid stats={data?.stats} />

      <DashboardPageViews stats={data?.stats} />

      {/* Contact feature hidden — RecentMessagesWidget removed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PopularFoodsWidget foods={data?.popularFoods || []} />
      </div>
    </>
  );
}
