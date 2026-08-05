import { useTranslations } from "next-intl";

interface FoodMenuHeaderProps {
  onManageCategories: () => void;
  onAddFood: () => void;
  onReorder: () => void;
}

export function FoodMenuHeader({ onManageCategories, onAddFood, onReorder }: FoodMenuHeaderProps) {
  const tFood = useTranslations("foodMenu");
  const tCommon = useTranslations("common");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{tFood("title")}</h2>
        <p className="text-foreground-secondary mt-1">{tFood("subtitle")}</p>
      </div>
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex w-full gap-3 sm:contents">
          <button
            onClick={onReorder}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            {tCommon("reorder")}
          </button>
          <button
            onClick={onManageCategories}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            {tFood("manageCategories")}
          </button>
        </div>
        <button
          onClick={onAddFood}
          className="w-full flex-1 sm:w-auto sm:flex-none inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
        >
          + {tFood("addFood")}
        </button>
      </div>
    </header>
  );
}
