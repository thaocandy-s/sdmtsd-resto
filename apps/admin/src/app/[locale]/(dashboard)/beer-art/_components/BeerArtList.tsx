import { useTranslations } from "next-intl";
import { BeerArt } from "./types";
import { BeerArtCard } from "./BeerArtCard";

interface BeerArtListProps {
  items: BeerArt[];
  loading: boolean;
  onEdit: (item: BeerArt) => void;
  onDelete: (id: string) => void;
}

export function BeerArtList({ items, loading, onEdit, onDelete }: BeerArtListProps) {
  const t = useTranslations("beerArt");

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noItems")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <BeerArtCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
