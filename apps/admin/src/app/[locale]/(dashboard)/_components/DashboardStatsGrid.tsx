import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface Stats {
  totalFoods: number;
  totalDrinks: number;
  totalBuffets: number;
  totalContacts: number;
  unreadContacts: number;
  todayPageViews: number;
  totalPageViews: number;
}

interface DashboardStatsGridProps {
  stats?: Stats;
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Link
        href={`/${locale}/food-menu`}
        className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-all hover:translate-y-[-2px] duration-200"
      >
        <p className="text-sm text-foreground-tertiary font-medium">{t("foodItems")}</p>
        <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalFoods ?? 0}</p>
      </Link>
      <Link
        href={`/${locale}/drink-menu`}
        className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-all hover:translate-y-[-2px] duration-200"
      >
        <p className="text-sm text-foreground-tertiary font-medium">{t("drinkItems")}</p>
        <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalDrinks ?? 0}</p>
      </Link>
      <Link
        href={`/${locale}/contact`}
        className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-all hover:translate-y-[-2px] duration-200"
      >
        <p className="text-sm text-foreground-tertiary font-medium">{t("messages")}</p>
        <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalContacts ?? 0}</p>
        {stats && stats.unreadContacts > 0 && (
          <p className="text-xs text-blue-400 mt-1">
            {stats.unreadContacts} {t("unread")}
          </p>
        )}
      </Link>
    </div>
  );
}
