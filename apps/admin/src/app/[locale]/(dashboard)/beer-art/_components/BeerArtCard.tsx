import { useTranslations } from "next-intl";
import { BeerArt } from "./types";

interface BeerArtCardProps {
  item: BeerArt;
  onEdit: (item: BeerArt) => void;
  onDelete: (id: string) => void;
}

export function BeerArtCard({ item, onEdit, onDelete }: BeerArtCardProps) {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");

  return (
    <div className="bg-background-secondary border border-border rounded-lg overflow-hidden group">
      <div className="aspect-square bg-background-tertiary">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
            {t("noImage")}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
        <p className="text-xs text-foreground-secondary">
          {item.isPublished ? tc("published") : tc("draft")}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit(item)}
            className="text-gold-400 hover:text-gold-300 text-xs"
          >
            {tc("edit")}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            {tc("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
