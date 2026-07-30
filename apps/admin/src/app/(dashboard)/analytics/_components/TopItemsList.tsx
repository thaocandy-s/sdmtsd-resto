import { useTranslations } from "next-intl";
import { AnalyticsTopItem } from "./types";
import { countryFlag, countryName } from "./country";

interface Props {
  title: string;
  items?: AnalyticsTopItem[];
  // Country lists carry ISO codes — render flag + localized region name
  isCountryList?: boolean;
}

// Ranked bar list shared by top categories / dishes / countries
export function TopItemsList({ title, items, isCountryList }: Props) {
  const t = useTranslations("analytics");

  const activeItems = (items || []).filter((item) => item.count > 0);
  const maxCount = activeItems[0]?.count ?? 1;
  const totalCount = activeItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      {activeItems.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{t("noData")}</p>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground truncate pr-2">
                  {isCountryList
                    ? `${countryFlag(item.key)} ${countryName(item.key)}`.trim()
                    : item.name}
                </span>
                <span className="text-sm text-foreground-secondary shrink-0">
                  {isCountryList && totalCount > 0 && (
                    <span className="mr-2">{Math.round((item.count / totalCount) * 100)}%</span>
                  )}
                  <span className="font-medium text-gold-400">{item.count.toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div
                  className="bg-gold-500/80 h-2 rounded-full"
                  style={{
                    width: `${Math.max((item.count / maxCount) * 100, 1)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
