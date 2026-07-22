"use client";

import { useTranslations } from "next-intl";
import { Restaurant } from "./types";

interface OpeningHoursSectionProps {
  restaurant: Restaurant | null;
}

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function OpeningHoursSection({ restaurant }: OpeningHoursSectionProps) {
  const t = useTranslations("info");

  return (
    <section className="bg-background-secondary border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("hours")}</h2>
      {restaurant?.openingHours ? (
        <div className="space-y-1">
          {DAY_KEYS.map((day) => {
            const hours = restaurant.openingHours?.[day];
            if (!hours) return null;
            return (
              <div key={day} className="flex justify-between text-foreground-secondary">
                <span className="capitalize">{day}</span>
                <span>{hours as string}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-foreground-secondary">Please contact us for opening hours</p>
      )}
    </section>
  );
}
