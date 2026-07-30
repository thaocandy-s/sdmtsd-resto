import { useTranslations } from "next-intl";
import { AnalyticsOverview } from "./types";

interface Props {
  overview?: AnalyticsOverview;
}

export function AnalyticsSummaryCards({ overview }: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("pageViews")}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
          {overview?.pageViews?.toLocaleString() || 0}
        </p>
        {overview?.changePercent !== undefined && (
          <p
            className={`text-xs mt-1 font-medium ${overview.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {overview.changePercent >= 0 ? "↑" : "↓"} {Math.abs(overview.changePercent)}%{" "}
            {t("vsPreviousPeriod")}
          </p>
        )}
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("visitors")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {overview?.visitors?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  );
}
