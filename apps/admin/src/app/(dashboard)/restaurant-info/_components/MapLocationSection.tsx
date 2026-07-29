"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RestaurantFormData } from "./types";

interface MapLocationSectionProps {
  form: RestaurantFormData;
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormData>>;
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

interface ParsedMapData {
  placeId: string | null;
  placeName: string | null;
  lat: string | null;
  lng: string | null;
}

/** Parse a Google Maps share / place URL into structured data. */
function parseGoogleMapsUrl(raw: string): ParsedMapData {
  const decoded = decodeURIComponent(raw);

  // Place ID (FTID) — e.g. !1s0x60188db5d1584905:0x7f9c34b68b70464f
  let placeId: string | null = null;
  const ftidMatch = decoded.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
  if (ftidMatch) placeId = ftidMatch[1];

  // Place Name — from /place/NAME/
  let placeName: string | null = null;
  const nameMatch = raw.match(/\/place\/([^/@]+)/);
  if (nameMatch) {
    placeName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
  }

  // Coordinates — prefer precise !3d / !4d over @lat,lng
  let lat: string | null = null;
  let lng: string | null = null;

  const match3d4d = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match3d4d) {
    lat = match3d4d[1];
    lng = match3d4d[2];
  } else {
    const matchAt = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchAt) {
      lat = matchAt[1];
      lng = matchAt[2];
    }
  }

  return { placeId, placeName, lat, lng };
}

export function MapLocationSection({ form, setForm }: MapLocationSectionProps) {
  const t = useTranslations("restaurantInfo");
  const [mapLinkInput, setMapLinkInput] = useState("");
  const [mapParseStatus, setMapParseStatus] = useState<{
    type: "success" | "error" | "idle";
    text: string;
  }>({ type: "idle", text: "" });

  const handleParseMapLink = () => {
    const raw = mapLinkInput.trim();
    if (!raw) {
      setMapParseStatus({
        type: "error",
        text: "Please paste a Google Maps link first.",
      });
      return;
    }

    if (
      !raw.includes("google.com/maps") &&
      !raw.includes("maps.app.goo.gl") &&
      !raw.includes("goo.gl/maps")
    ) {
      setMapParseStatus({
        type: "error",
        text: "This does not look like a Google Maps URL. Please copy the link from the browser address bar on Google Maps.",
      });
      return;
    }

    const parsed = parseGoogleMapsUrl(raw);

    if (!parsed.placeId && !parsed.lat && !parsed.lng) {
      setMapParseStatus({
        type: "error",
        text: "Could not extract location data from this URL. Please make sure you copy the full URL from the browser address bar.",
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      latitude: parsed.lat || prev.latitude,
      longitude: parsed.lng || prev.longitude,
      googlePlaceId: parsed.placeId || prev.googlePlaceId,
      googleMapQuery: parsed.placeName || prev.googleMapQuery,
    }));

    const parts: string[] = [];
    if (parsed.placeName) parts.push(`Place: ${parsed.placeName}`);
    if (parsed.placeId) parts.push(`ID: ${parsed.placeId}`);
    if (parsed.lat && parsed.lng) parts.push(`Coordinates: ${parsed.lat}, ${parsed.lng}`);

    setMapParseStatus({
      type: "success",
      text: `✅ Extracted — ${parts.join(" · ")}`,
    });
  };

  const handleClearMap = () => {
    setForm((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      googlePlaceId: "",
      googleMapQuery: "",
    }));
    setMapLinkInput("");
    setMapParseStatus({ type: "idle", text: "" });
  };

  const mapPreviewUrl: string | null = (() => {
    if (form.googlePlaceId && form.googleMapQuery && form.latitude && form.longitude) {
      return buildPbEmbedUrl(
        form.googlePlaceId,
        form.googleMapQuery,
        parseFloat(form.latitude),
        parseFloat(form.longitude)
      );
    }
    if (form.googleMapQuery) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        form.googleMapQuery
      )}&hl=ja&z=16&output=embed`;
    }
    if (form.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        form.address
      )}&hl=ja&z=16&output=embed`;
    }
    return null;
  })();

  return (
    <div className="pt-4 border-t border-border space-y-4">
      <h3 className="text-md font-semibold text-foreground">📍 {t("mapLocationTitle")}</h3>

      {/* Paste input */}
      <div className="bg-background p-4 rounded-lg border border-border/80 space-y-3">
        <label className="block text-sm font-medium text-foreground">{t("mapInstruction")}</label>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={mapLinkInput}
            onChange={(e) => setMapLinkInput(e.target.value)}
            onPaste={() => {
              setTimeout(() => handleParseMapLink(), 50);
            }}
            placeholder={t("pastePlaceholder")}
            className="flex-1 bg-background-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-gold-500 text-sm font-mono w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleParseMapLink();
              }
            }}
          />
          <button
            type="button"
            onClick={handleParseMapLink}
            className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap w-full sm:w-auto flex items-center justify-center h-[42px] sm:h-auto"
          >
            {t("extract")}
          </button>
        </div>

        {mapParseStatus.type !== "idle" && (
          <p
            className={`text-xs mt-1 ${
              mapParseStatus.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {mapParseStatus.text}
          </p>
        )}
      </div>

      {/* Extracted data badges */}
      {(form.googleMapQuery || form.googlePlaceId) && (
        <div className="bg-background p-4 rounded-lg border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("extractedData")}</span>
            <button
              type="button"
              onClick={handleClearMap}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {t("clearMapData")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.googleMapQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-xs text-gold-400">
                📌 {form.googleMapQuery}
              </span>
            )}
            {form.googlePlaceId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-mono">
                ID: {form.googlePlaceId}
              </span>
            )}
            {form.latitude && form.longitude && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-mono">
                📍 {form.latitude}, {form.longitude}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Live Preview */}
      <div>
        <span className="block text-xs text-foreground-secondary mb-2">{t("livePreview")}</span>
        {mapPreviewUrl ? (
          <div className="h-72 bg-background border border-border rounded-lg overflow-hidden">
            <iframe
              key={mapPreviewUrl}
              src={mapPreviewUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Map Preview"
            />
          </div>
        ) : (
          <div className="h-48 bg-background border border-border rounded-lg flex items-center justify-center text-foreground-tertiary text-sm">
            {t("mapPlaceholder")}
          </div>
        )}
      </div>
    </div>
  );
}
