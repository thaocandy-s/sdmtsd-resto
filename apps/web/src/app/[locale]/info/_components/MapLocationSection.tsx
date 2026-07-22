"use client";

import { useTranslations } from "next-intl";
import { Restaurant } from "./types";

interface MapLocationSectionProps {
  restaurant: Restaurant | null;
}

/** Build the Google Maps pb-embed URL that renders the full Place Card. */
function buildPbEmbedUrl(placeId: string, placeName: string, lat: number, lng: number): string {
  const pid = encodeURIComponent(placeId);
  const pn = encodeURIComponent(placeName);
  return (
    `https://www.google.com/maps/embed?pb=` +
    `!1m14!1m8!1m3!1d3241` +
    `!2d${lng}!3d${lat}` +
    `!3m2!1i1024!2i768!4f13.1` +
    `!3m3!1m2!1s${pid}!2s${pn}` +
    `!5e0!3m2!1sja!2sjp`
  );
}

/** Determine the best embed URL based on available restaurant data. */
function getMapEmbedUrl(r: Restaurant): string | null {
  // Priority 1: Place ID (guaranteed full Place Card)
  if (r.googlePlaceId && r.googleMapQuery && r.latitude && r.longitude) {
    return buildPbEmbedUrl(r.googlePlaceId, r.googleMapQuery, r.latitude, r.longitude);
  }

  // Priority 2: Google Map query (place name search)
  if (r.googleMapQuery) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      r.googleMapQuery
    )}&hl=ja&z=16&output=embed`;
  }

  // Priority 3: Address search
  if (r.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      r.address
    )}&hl=ja&z=16&output=embed`;
  }

  return null;
}

export function MapLocationSection({ restaurant }: MapLocationSectionProps) {
  const t = useTranslations("info");
  const mapUrl = restaurant ? getMapEmbedUrl(restaurant) : null;

  return (
    <section className="bg-background-secondary border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("map")}</h2>
      {mapUrl ? (
        <div className="aspect-video bg-background-tertiary rounded-lg overflow-hidden border border-border/50">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Restaurant location"
          />
        </div>
      ) : (
        <div className="h-64 bg-background-tertiary rounded-lg flex items-center justify-center text-foreground-tertiary">
          Map not available
        </div>
      )}
    </section>
  );
}
