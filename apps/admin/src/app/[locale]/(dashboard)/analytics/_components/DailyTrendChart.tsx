import { useTranslations } from "next-intl";
import { DailyStat } from "./types";

interface Props {
  dailyData?: DailyStat[];
}

export function DailyTrendChart({ dailyData }: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-bold text-foreground mb-4">{t("dailyTrend")}</h3>
      {!dailyData || dailyData.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{t("noData")}</p>
      ) : (
        <div className="space-y-1">
          <div className="flex items-end gap-[2px] h-40">
            {dailyData.map((day) => {
              const maxViews = Math.max(...dailyData.map((d) => d.pageViews), 1);
              const heightPercent = (day.pageViews / maxViews) * 100;
              const dateStr = new Date(day.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  <div className="absolute -top-12 bg-background-tertiary border border-border rounded px-2 py-1 text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {dateStr}: {day.pageViews} {t("views")}
                  </div>
                  <div
                    className="w-full bg-gold-500/80 hover:bg-gold-400 rounded-t transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(heightPercent, 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-foreground-secondary pt-2">
            <span>
              {new Date(dailyData[0]?.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {dailyData.length > 2 && (
              <span>
                {new Date(dailyData[Math.floor(dailyData.length / 2)]?.date).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric" }
                )}
              </span>
            )}
            <span>
              {new Date(dailyData[dailyData.length - 1]?.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
