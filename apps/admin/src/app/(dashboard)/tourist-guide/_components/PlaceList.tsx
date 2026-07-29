import { useTranslations } from "next-intl";
import { Place } from "./types";
import { PlaceRow } from "./PlaceRow";
import { PlaceCard } from "./PlaceCard";

interface PlaceListProps {
  places: Place[];
  onEdit: (p: Place) => void;
  onDelete: (id: string) => void;
}

export function PlaceList({ places, onEdit, onDelete }: PlaceListProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");

  if (places.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noPlaces")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tablet & Desktop Table View (>=768px) */}
      <div className="hidden md:block bg-background-secondary border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-tertiary">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("nameLabel")}
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("categoryLabel")}
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                {tc("status")}
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground-secondary">
                {tc("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {places.map((p) => (
              <PlaceRow key={p.id} place={p} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (<768px) */}
      <div className="block md:hidden space-y-3">
        {places.map((p) => (
          <PlaceCard key={p.id} place={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
