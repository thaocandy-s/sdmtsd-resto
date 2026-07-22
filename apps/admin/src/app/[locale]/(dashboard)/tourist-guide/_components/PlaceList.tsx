import { useTranslations } from "next-intl";
import { Place } from "./types";

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
    <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
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
            <tr key={p.id} className="hover:bg-background-tertiary/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background-tertiary rounded overflow-hidden flex-shrink-0">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-foreground-secondary">{p.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground-secondary">
                {p.category?.name || "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${p.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                >
                  {p.isPublished ? tc("published") : tc("draft")}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(p)}
                  className="text-gold-400 hover:text-gold-300 text-sm mr-3"
                >
                  {tc("edit")}
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  {tc("delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
