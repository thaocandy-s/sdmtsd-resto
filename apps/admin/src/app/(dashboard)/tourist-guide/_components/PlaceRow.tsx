import { useTranslations } from "next-intl";
import { Place } from "./types";

interface PlaceRowProps {
  place: Place;
  onEdit: (p: Place) => void;
  onDelete: (id: string) => void;
}

export function PlaceRow({ place, onEdit, onDelete }: PlaceRowProps) {
  const tc = useTranslations("common");

  return (
    <tr className="hover:bg-background-tertiary/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background-tertiary rounded overflow-hidden flex-shrink-0">
            {place.imageUrl && (
              <img src={place.imageUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{place.name}</p>
            <p className="text-xs text-foreground-secondary">{place.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground-secondary">{place.category?.name || "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-1 rounded ${place.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
        >
          {place.isPublished ? tc("published") : tc("draft")}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEdit(place)}
          className="text-gold-400 hover:text-gold-300 text-sm mr-3"
        >
          {tc("edit")}
        </button>
        <button
          onClick={() => onDelete(place.id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          {tc("delete")}
        </button>
      </td>
    </tr>
  );
}
