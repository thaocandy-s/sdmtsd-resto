import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface Food {
  id: string;
  name: string;
  price: number;
  isPopular: boolean;
}

interface PopularFoodsWidgetProps {
  foods: Food[];
}

export function PopularFoodsWidget({ foods }: PopularFoodsWidgetProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground">{t("popularFoods")}</h3>
        <Link
          href={`/${locale}/food-menu`}
          className="text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors"
        >
          {t("manage")} &rarr;
        </Link>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 max-h-[300px]">
        {foods.length === 0 ? (
          <p className="text-sm text-foreground-tertiary">{t("noFoods")}</p>
        ) : (
          foods.map((food, idx) => (
            <div
              key={food.id}
              className="flex items-center justify-between py-2 border-b border-border/60 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                  {food.name}
                </span>
              </div>
              <span className="text-sm text-gold-400 font-semibold flex-shrink-0">
                ¥{food.price.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
