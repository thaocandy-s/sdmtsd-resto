import React from "react";

interface DrinkBadgesProps {
  isPopular?: boolean;
  alcoholPercent?: number | null;
  volume?: string | null;
  className?: string;
}

export function DrinkBadges({
  isPopular,
  alcoholPercent,
  volume,
  className = "",
}: DrinkBadgesProps) {
  const hasBadges =
    isPopular || (alcoholPercent !== null && alcoholPercent !== undefined) || !!volume;
  if (!hasBadges) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {isPopular && (
        <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-400 border border-gold-500/30 font-medium rounded-md whitespace-nowrap">
          Popular
        </span>
      )}
      {alcoholPercent !== null && alcoholPercent !== undefined && (
        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium rounded-md whitespace-nowrap">
          {alcoholPercent}% ABV
        </span>
      )}
      {volume && (
        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium rounded-md whitespace-nowrap">
          {volume}
        </span>
      )}
    </div>
  );
}
