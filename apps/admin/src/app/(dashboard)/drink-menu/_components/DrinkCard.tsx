import { Drink } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";
import { StatusBadge } from "./StatusBadge";
import { DrinkBadges } from "./DrinkBadges";
import { ActionsMenu } from "./ActionsMenu";

interface DrinkCardProps {
  drink: Drink;
  onEdit: (drink: Drink) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (drink: Drink) => void;
}

export function DrinkCard({ drink, onEdit, onDelete, onDuplicate }: DrinkCardProps) {
  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-border/80 transition-colors">
      {/* Top Header Row: Thumbnail + Info + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-background-tertiary flex-shrink-0">
            {drink.imageUrl ? (
              <img src={drink.imageUrl} alt={drink.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
                No img
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-snug break-words">
              {drink.name}
            </h3>
            {drink.category?.name && (
              <p className="text-xs text-foreground-tertiary mt-0.5 font-medium truncate">
                {drink.category.name}
              </p>
            )}
          </div>
        </div>

        {/* 3-Dot Dropdown Menu */}
        <div className="-mr-1 -mt-1 flex-shrink-0">
          <ActionsMenu
            onEdit={() => onEdit(drink)}
            onDelete={() => onDelete(drink.id)}
            onDuplicate={onDuplicate ? () => onDuplicate(drink) : undefined}
          />
        </div>
      </div>

      {/* Middle Row: Badges (Status + Drink Badges) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
        <StatusBadge status={drink.status} />
        <DrinkBadges
          isPopular={drink.isPopular}
          alcoholPercent={drink.alcoholPercent}
          volume={drink.volume}
        />
      </div>

      {/* Bottom Row: Price */}
      <div className="flex items-center justify-between text-sm font-medium pt-1">
        <span className="text-foreground-secondary text-xs">Price (incl. tax)</span>
        <span className="text-gold-400 font-semibold text-base">
          {formatPriceWithTax(drink.price)}
        </span>
      </div>
    </div>
  );
}
