import { useTranslations } from "next-intl";
import { Place } from "./types";

interface PlaceCardProps {
  place: Place;
  onEdit: (p: Place) => void;
  onDelete: (id: string) => void;
}

export function PlaceCard({ place, onEdit, onDelete }: PlaceCardProps) {
  const tc = useTranslations("common");

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-background-tertiary rounded overflow-hidden flex-shrink-0">
          {place.imageUrl && (
            <img src={place.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{place.name}</p>
          <p className="text-xs text-foreground-secondary truncate">{place.slug}</p>
          {place.category?.name && (
            <span className="inline-block text-xs bg-background-tertiary text-foreground-secondary px-2 py-0.5 rounded mt-1">
              {place.category.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-sm">
        <span
          className={`text-xs px-2.5 py-0.5 rounded font-medium ${
            place.isPublished
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {place.isPublished ? tc("published") : tc("draft")}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(place)}
            className="text-gold-400 hover:text-gold-300 font-medium"
          >
            {tc("edit")}
          </button>
          <button
            onClick={() => onDelete(place.id)}
            className="text-red-400 hover:text-red-300 font-medium"
          >
            {tc("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
