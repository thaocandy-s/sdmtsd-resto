"use client";

import { useTranslations } from "next-intl";
import { RestaurantFormData } from "./types";

interface OpeningHoursSectionProps {
  form: RestaurantFormData;
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormData>>;
}

const DAYS = [
  { key: "monday", label: "Monday (Thứ 2)" },
  { key: "tuesday", label: "Tuesday (Thứ 3)" },
  { key: "wednesday", label: "Wednesday (Thứ 4)" },
  { key: "thursday", label: "Thursday (Thứ 5)" },
  { key: "friday", label: "Friday (Thứ 6)" },
  { key: "saturday", label: "Saturday (Thứ 7)" },
  { key: "sunday", label: "Sunday (Chủ nhật)" },
];

// Tạo danh sách giờ từ 00:00 đến 23:30 (mỗi nấc 30 phút)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

/** Helper bóc tách chuỗi giờ "11:00 - 22:00" thành state chọn */
function parseTimeRange(value?: string) {
  if (!value || value.toLowerCase() === "closed") {
    return { isClosed: true, openTime: "11:00", closeTime: "22:00" };
  }
  const parts = value.split("-").map((s) => s.trim());
  if (parts.length >= 2) {
    return { isClosed: false, openTime: parts[0], closeTime: parts[1] };
  }
  return { isClosed: false, openTime: "11:00", closeTime: "22:00" };
}

export function OpeningHoursSection({ form, setForm }: OpeningHoursSectionProps) {
  const t = useTranslations("restaurantInfo");

  const handleToggleClosed = (key: string, currentIsClosed: boolean) => {
    const currentParsed = parseTimeRange(form.openingHours[key]);
    const nextIsClosed = !currentIsClosed;

    const newValue = nextIsClosed
      ? "Closed"
      : `${currentParsed.openTime} - ${currentParsed.closeTime}`;

    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [key]: newValue,
      },
    }));
  };

  const handleTimeChange = (key: string, type: "open" | "close", newTime: string) => {
    const currentParsed = parseTimeRange(form.openingHours[key]);
    const openTime = type === "open" ? newTime : currentParsed.openTime;
    const closeTime = type === "close" ? newTime : currentParsed.closeTime;

    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [key]: `${openTime} - ${closeTime}`,
      },
    }));
  };

  return (
    <div className="pt-4 border-t border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-foreground">⏰ {t("openingHoursTitle")}</h3>
      </div>

      {/* Opening Hours Selector Grid */}
      <div className="space-y-3 bg-background p-4 rounded-lg border border-border/80">
        <span className="block text-xs font-medium text-foreground-secondary mb-2">
          {t("openingHoursDesc")}
        </span>

        {DAYS.map(({ key }) => {
          const { isClosed, openTime, closeTime } = parseTimeRange(form.openingHours[key]);
          const dayName = t(`days.${key}`);

          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-background-secondary/50 hover:bg-background-secondary transition-colors"
            >
              {/* Day Label & Toggle Status */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={!isClosed}
                    onChange={() => handleToggleClosed(key, isClosed)}
                    className="rounded border-border text-gold-500 focus:ring-gold-500"
                  />
                  <span>{dayName}</span>
                </label>
              </div>

              {/* Status Badge & Selects */}
              {isClosed ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded font-medium">
                    {t("closed")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-foreground-secondary">{t("from")}</span>
                    <select
                      value={openTime}
                      onChange={(e) => handleTimeChange(key, "open", e.target.value)}
                      className="bg-background border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-gold-500 text-xs font-mono"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-foreground-tertiary">{t("to")}</span>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={closeTime}
                      onChange={(e) => handleTimeChange(key, "close", e.target.value)}
                      className="bg-background border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-gold-500 text-xs font-mono"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="inline-block ml-2 px-2 py-0.5 bg-green-500/10 text-green-400 text-[11px] rounded font-mono">
                    {openTime} - {closeTime}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
