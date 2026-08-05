import { useTranslations } from "next-intl";

interface GuideHeaderProps {
  tab: "places" | "categories";
  setTab: (tab: "places" | "categories") => void;
  placesCount: number;
  categoriesCount: number;
  onAdd: () => void;
  onReorder: () => void;
}

export function GuideHeader({
  tab,
  setTab,
  placesCount,
  categoriesCount,
  onAdd,
  onReorder,
}: GuideHeaderProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");

  return (
    <>
      <header className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-2 md:mt-1">{t("subtitle")}</p>
        </div>
        <div className="hidden flex-wrap items-stretch gap-3 md:flex">
          <button
            onClick={onReorder}
            className="bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {tc("reorder")}
          </button>
          <button
            onClick={onAdd}
            className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + {tc("add")} {tab === "places" ? t("placesTab") : t("categoriesTab")}
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-5 md:mb-6 border-b border-border">
        <button
          onClick={() => setTab("places")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "places"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("placesTab")} ({placesCount})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "categories"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("categoriesTab")} ({categoriesCount})
        </button>
      </div>

      <div className="flex flex-col items-stretch gap-3 mb-6 md:hidden">
        <button
          onClick={onAdd}
          className="order-1 w-full min-h-[44px] bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + {tc("add")} {tab === "places" ? t("placesTab") : t("categoriesTab")}
        </button>
        <button
          onClick={onReorder}
          className="order-2 self-start bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {tc("reorder")}
        </button>
      </div>
    </>
  );
}
