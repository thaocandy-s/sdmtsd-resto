"use client";

import { useTranslations } from "next-intl";
import { TourPlace } from "./types";

interface TourPlaceInfoProps {
  place: TourPlace;
}

export function TourPlaceInfo({ place }: TourPlaceInfoProps) {
  const t = useTranslations("tourist");

  return (
    <>
      {/* Description */}
      {place.description && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-3">{t("about")}</h2>
          <p className="text-foreground-secondary leading-relaxed">{place.description}</p>
        </section>
      )}

      {/* Info Card */}
      <section className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">{t("info")}</h2>
        <dl className="space-y-3">
          {place.address && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">{t("address")}</dt>
              <dd className="text-foreground">{place.address}</dd>
            </div>
          )}
          {place.openingHours && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">{t("hours")}</dt>
              <dd className="text-foreground">{place.openingHours}</dd>
            </div>
          )}
          {place.phone && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">{t("phone")}</dt>
              <dd className="text-foreground">
                <a href={`tel:${place.phone}`} className="text-gold-400 hover:text-gold-300">
                  {place.phone}
                </a>
              </dd>
            </div>
          )}
          {place.websiteUrl && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">{t("website")}</dt>
              <dd className="text-foreground">
                <a
                  href={place.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300"
                >
                  {t("visitWebsite")} &rarr;
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </>
  );
}
