import { useTranslations } from "next-intl";

interface Stats {
  todayPageViews: number;
  todayUniqueVisitors: number;
  weekPageViews: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
}

interface DashboardPageViewsProps {
  stats?: Stats;
}

export function DashboardPageViews({ stats }: DashboardPageViewsProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("todayViews")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {stats?.todayPageViews ?? 0}
        </p>
        {stats && stats.todayUniqueVisitors > 0 && (
          <p className="text-xs text-foreground-secondary mt-1">
            {stats.todayUniqueVisitors} {t("uniqueVisitors")}
          </p>
        )}
      </div>
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("weekViews")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {stats?.weekPageViews ?? 0}
        </p>
      </div>
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("totalViews")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {stats?.totalPageViews ?? 0}
        </p>
      </div>
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("totalUniqueVisitors")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {stats?.totalUniqueVisitors ?? 0}
        </p>
      </div>
    </div>
  );
}
