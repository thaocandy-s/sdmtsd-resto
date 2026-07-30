import { useTranslations } from "next-intl";
import { AnalyticsOverview } from "./types";

interface Props {
  overview?: AnalyticsOverview;
}

// Period-over-period change in percent (100% when growing from zero)
function changePercent(current: number, previous: number): number {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  return current > 0 ? 100 : 0;
}

function ChangeBadge({ percent }: { percent: number }) {
  const t = useTranslations("analytics");

  return (
    <p className={`text-xs mt-1 font-medium ${percent >= 0 ? "text-green-400" : "text-red-400"}`}>
      {percent >= 0 ? "↑" : "↓"} {Math.abs(percent)}% {t("vsPreviousPeriod")}
    </p>
  );
}

export function AnalyticsSummaryCards({ overview }: Props) {
  const t = useTranslations("analytics");

  const cards = [
    {
      label: t("visitors"),
      value: overview?.visitors ?? 0,
      percent: changePercent(overview?.visitors ?? 0, overview?.prevVisitors ?? 0),
      valueClass: "text-gold-400",
    },
    {
      label: t("pageViews"),
      value: overview?.pageViews ?? 0,
      percent: changePercent(overview?.pageViews ?? 0, overview?.prevPageViews ?? 0),
      valueClass: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-background-secondary border border-border rounded-lg p-4 md:p-6"
        >
          <p className="text-foreground-secondary text-sm">{card.label}</p>
          <p className={`text-2xl md:text-3xl font-bold mt-2 ${card.valueClass}`}>
            {card.value.toLocaleString()}
          </p>
          <ChangeBadge percent={card.percent} />
        </div>
      ))}
    </div>
  );
}
