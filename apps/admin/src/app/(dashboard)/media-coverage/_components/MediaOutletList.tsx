import { useTranslations } from "next-intl";
import { MediaOutlet } from "./types";
import { MediaOutletCard } from "./MediaOutletCard";

interface MediaOutletListProps {
  items: MediaOutlet[];
  loading: boolean;
  onEdit: (item: MediaOutlet) => void;
  onDelete: (id: string) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function MediaOutletList({
  items,
  loading,
  onEdit,
  onDelete,
  getHighlightProps,
}: MediaOutletListProps) {
  const t = useTranslations("mediaCoverage");

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noOutlets")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <MediaOutletCard
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
