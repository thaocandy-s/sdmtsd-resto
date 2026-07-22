"use client";

import { useTranslations } from "next-intl";

export interface Winner {
  id: string;
  participantName: string;
  imageUrl: string | null;
  challengeName: string | null;
  discountAwarded: string | null;
  completedAt: string;
}

interface WinnerCardProps {
  winner: Winner;
}

export function WinnerCard({ winner }: WinnerCardProps) {
  const t = useTranslations("challenge");

  return (
    <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
      <div className="aspect-square bg-background-tertiary">
        {winner.imageUrl ? (
          <img
            src={winner.imageUrl}
            alt={winner.participantName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
            {t("noPhoto")}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{winner.participantName}</h3>
        {winner.challengeName && (
          <p className="text-xs text-foreground-secondary truncate">{winner.challengeName}</p>
        )}
        {winner.discountAwarded && (
          <p className="text-xs text-gold-400 mt-1">{winner.discountAwarded}</p>
        )}
      </div>
    </div>
  );
}
