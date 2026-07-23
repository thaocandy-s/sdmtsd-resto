import { useTranslations } from "next-intl";
import { SectionBreakdown } from "./types";

interface Props {
  sectionBreakdown?: SectionBreakdown[];
}

const SECTION_KEYS: Record<string, string> = {
  home: "sectionHome",
  menu: "sectionMenu",
  drink: "sectionDrink",
  buffet: "sectionBuffet",
  beerArt: "sectionBeerArt",
  challenge: "sectionChallenge",
  tourist: "sectionTourist",
  info: "sectionInfo",
  faq: "sectionFaq",
  contact: "sectionContact",
  reservation: "sectionReservation",
};

export function SectionBreakdownList({ sectionBreakdown }: Props) {
  const t = useTranslations("analytics");

  const activeSections = (sectionBreakdown || []).filter((item) => item.views > 0);
  const maxSectionViews = activeSections[0]?.views ?? 1;

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{t("sectionBreakdown")}</h3>
      {activeSections.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{t("noData")}</p>
      ) : (
        <div className="space-y-3">
          {activeSections.map((item) => (
            <div key={item.section}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">
                  {t(SECTION_KEYS[item.section] || item.section)}
                </span>
                <span className="text-sm font-medium text-gold-400">
                  {item.views.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div
                  className="bg-gold-500/80 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((item.views / maxSectionViews) * 100, 1)}%`,
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
