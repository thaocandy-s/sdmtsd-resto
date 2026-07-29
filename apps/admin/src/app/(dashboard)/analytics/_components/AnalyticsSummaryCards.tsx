import { useTranslations } from "next-intl";
import { AnalyticsSummary } from "./types";

interface Props {
  summary?: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("totalPageViews")}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
          {summary?.totalPageViews?.toLocaleString() || 0}
        </p>
        {summary?.changePercent !== undefined && (
          <p
            className={`text-xs mt-1 font-medium ${summary.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {summary.changePercent >= 0 ? "↑" : "↓"} {Math.abs(summary.changePercent)}%{" "}
            {t("vsPreviousPeriod")}
          </p>
        )}
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("uniqueVisitors")}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
          {summary?.uniqueVisitors?.toLocaleString() || 0}
        </p>
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("reservationClicks")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {summary?.reservationClicks?.toLocaleString() || 0}
        </p>
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-4 md:p-6">
        <p className="text-foreground-secondary text-sm">{t("contactClicks")}</p>
        <p className="text-2xl md:text-3xl font-bold text-gold-400 mt-2">
          {summary?.contactClicks?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  );
}
