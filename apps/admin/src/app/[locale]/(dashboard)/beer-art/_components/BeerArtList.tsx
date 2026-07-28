import { useTranslations } from "next-intl";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { BeerArt } from "./types";
import { BeerArtCard } from "./BeerArtCard";

interface BeerArtListProps {
  items: BeerArt[];
  loading: boolean;
  onEdit: (item: BeerArt) => void;
  onDelete: (id: string) => void;
  reorderEnabled?: boolean;
  onReorder?: (orderedIds: string[]) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function BeerArtList({
  items,
  loading,
  onEdit,
  onDelete,
  reorderEnabled,
  onReorder,
  getHighlightProps,
}: BeerArtListProps) {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");

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

  if (reorderEnabled && onReorder) {
    return (
      <SortableList
        items={items}
        onReorder={onReorder}
        className="space-y-3"
        renderItem={(item, index, handle) => {
          const hp = getHighlightProps?.(item.id);
          return (
            <div
              {...hp}
              className={`bg-background-secondary border border-border rounded-lg p-3 flex items-center gap-3 ${
                hp?.className ?? ""
              }`}
            >
              {handle}
              <OrderBadge order={index + 1} />
              <div className="w-14 h-14 rounded bg-background-tertiary overflow-hidden flex-shrink-0">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-foreground-secondary">
                  {item.isPublished ? tc("published") : tc("draft")}
                  {item.isPopular ? ` · ${t("popularLabel")}` : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(item)}
                  className="text-gold-400 hover:text-gold-300 text-sm"
                >
                  {tc("edit")}
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  {tc("delete")}
                </button>
              </div>
            </div>
          );
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <BeerArtCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          getHighlightProps={getHighlightProps}
        />
      ))}
    </div>
  );
}
