import { useTranslations } from "next-intl";
import { DailyStat } from "./types";

interface Props {
  dailyData?: DailyStat[];
}

export function DailyVisitorsTable({ dailyData }: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{t("recentDays")}</h3>
      {!dailyData || dailyData.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{t("noData")}</p>
      ) : (
        <div className="overflow-y-auto max-h-[360px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background-secondary">
              <tr className="border-b border-border">
                <th className="text-left py-2 text-foreground-secondary font-medium">
                  {t("date")}
                </th>
                <th className="text-right py-2 text-foreground-secondary font-medium">
                  {t("views")}
                </th>
                <th className="text-right py-2 text-foreground-secondary font-medium">
                  {t("visitors")}
                </th>
              </tr>
            </thead>
            <tbody>
              {[...dailyData].reverse().map((day) => (
                <tr key={day.date} className="border-b border-border/50 last:border-0">
                  <td className="py-2 text-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </td>
                  <td className="py-2 text-right text-foreground font-medium">
                    {day.pageViews.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-foreground-secondary">
                    {day.uniqueVisitors.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
