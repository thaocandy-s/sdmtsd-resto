import React from "react";
import { useTranslations } from "next-intl";

interface FoodBadgesProps {
  isPopular?: boolean;
  isRecommended?: boolean;
  className?: string;
}

export function FoodBadges({ isPopular, isRecommended, className = "" }: FoodBadgesProps) {
  const t = useTranslations("foodMenu");

  if (!isPopular && !isRecommended) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {isPopular && (
        <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-400 border border-gold-500/30 font-medium rounded-md whitespace-nowrap">
          {t("popularLabel")}
        </span>
      )}
      {isRecommended && (
        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium rounded-md whitespace-nowrap">
          {t("recommendedLabel")}
        </span>
      )}
    </div>
  );
}
