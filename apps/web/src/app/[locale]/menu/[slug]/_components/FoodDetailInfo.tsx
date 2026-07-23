"use client";

import { useTranslations } from "next-intl";
import { Food } from "./types";

interface FoodDetailInfoProps {
  food: Food;
  formatPrice: (price: number) => string;
}

export function FoodDetailInfo({ food, formatPrice }: FoodDetailInfoProps) {
  const t = useTranslations("menu");
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-gold-500/10 text-gold-400 text-xs rounded">
          {food.category.name}
        </span>
        {food.isPopular && (
          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
            {t("popular")}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-jp font-bold text-foreground mb-4">{food.name}</h1>

      {food.description && <p className="text-foreground-secondary mb-6">{food.description}</p>}

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-2xl font-bold text-gold-400">{formatPrice(food.price)}</span>
        {food.originalPrice && (
          <span className="text-lg text-foreground-tertiary line-through">
            {formatPrice(food.originalPrice)}
          </span>
        )}
      </div>

      {food.calories && (
        <p className="text-sm text-foreground-secondary mb-4">{food.calories} kcal</p>
      )}

      {food.allergens.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground-secondary mb-2">{t("allergens")}</h3>
          <div className="flex flex-wrap gap-2">
            {food.allergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {food.ingredients && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground-secondary mb-2">{t("ingredients")}</h3>
          <p className="text-sm text-foreground-secondary">{food.ingredients}</p>
        </div>
      )}
    </div>
  );
}
