import { useTranslations } from "next-intl";

interface Stats {
  todayPageViews: number;
  totalPageViews: number;
}

interface DashboardPageViewsProps {
  stats?: Stats;
}

export function DashboardPageViews({ stats }: DashboardPageViewsProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("todayViews")}</p>
        <p className="text-3xl font-bold text-gold-400 mt-2">{stats?.todayPageViews ?? 0}</p>
      </div>
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <p className="text-sm text-foreground-tertiary font-medium">{t("totalViews")}</p>
        <p className="text-3xl font-bold text-gold-400 mt-2">{stats?.totalPageViews ?? 0}</p>
      </div>
    </div>
  );
}
