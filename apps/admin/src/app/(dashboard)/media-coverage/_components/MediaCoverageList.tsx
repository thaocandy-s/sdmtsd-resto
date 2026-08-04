import { useTranslations } from "next-intl";
import { MediaCoverage } from "./types";
import { MediaCoverageCard } from "./MediaCoverageCard";

interface MediaCoverageListProps {
  items: MediaCoverage[];
  loading: boolean;
  onEdit: (item: MediaCoverage) => void;
  onDelete: (id: string) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function MediaCoverageList({
  items,
  loading,
  onEdit,
  onDelete,
  getHighlightProps,
}: MediaCoverageListProps) {
  const t = useTranslations("mediaCoverage");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noArticles")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <MediaCoverageCard
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
