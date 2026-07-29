import { useTranslations } from "next-intl";

interface DrinkMenuHeaderProps {
  onManageCategories: () => void;
  onAddDrink: () => void;
}

export function DrinkMenuHeader({ onManageCategories, onAddDrink }: DrinkMenuHeaderProps) {
  const t = useTranslations("drinkMenu");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
      </div>
      <div className="flex flex-wrap items-stretch gap-3">
        <button
          onClick={onManageCategories}
          className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
        >
          {t("manageCategories")}
        </button>
        <button
          onClick={onAddDrink}
          className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
        >
          + {t("addDrink")}
        </button>
      </div>
    </header>
  );
}
