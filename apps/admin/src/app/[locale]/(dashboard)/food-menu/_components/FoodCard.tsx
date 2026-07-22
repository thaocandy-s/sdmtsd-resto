import { useTranslations } from "next-intl";
import { Food } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";
import { StatusBadge } from "./StatusBadge";
import { FoodBadges } from "./FoodBadges";
import { ActionsMenu } from "./ActionsMenu";

interface FoodCardProps {
  food: Food;
  onEdit: (food: Food) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (food: Food) => void;
}

export function FoodCard({ food, onEdit, onDelete, onDuplicate }: FoodCardProps) {
  const t = useTranslations("foodMenu");

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-border/80 transition-colors">
      {/* Top Header Row: Thumbnail + Info + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-background-tertiary flex-shrink-0">
            {food.imageUrl ? (
              <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
                {t("noImage")}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-snug break-words">
              {food.name}
            </h3>
            {food.category?.name && (
              <p className="text-xs text-foreground-tertiary mt-0.5 font-medium truncate">
                {food.category.name}
              </p>
            )}
          </div>
        </div>

        {/* 3-Dot Dropdown Menu */}
        <div className="-mr-1 -mt-1 flex-shrink-0">
          <ActionsMenu
            onEdit={() => onEdit(food)}
            onDelete={() => onDelete(food.id)}
            onDuplicate={onDuplicate ? () => onDuplicate(food) : undefined}
          />
        </div>
      </div>

      {/* Middle Row: Badges (Status + Tags) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
        <StatusBadge status={food.status} />
        <FoodBadges isPopular={food.isPopular} isRecommended={food.isRecommended} />
      </div>

      {/* Bottom Row: Price */}
      <div className="flex items-center justify-between text-sm font-medium pt-1">
        <span className="text-foreground-secondary text-xs">{t("priceInclTax")}</span>
        <span className="text-gold-400 font-semibold text-base">
          {formatPriceWithTax(food.price)}
        </span>
      </div>
    </div>
  );
}
