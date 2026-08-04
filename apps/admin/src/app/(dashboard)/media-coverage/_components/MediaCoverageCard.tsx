import { useTranslations } from "next-intl";
import { MediaCoverage } from "./types";

interface MediaCoverageCardProps {
  item: MediaCoverage;
  onEdit: (item: MediaCoverage) => void;
  onDelete: (id: string) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function MediaCoverageCard({
  item,
  onEdit,
  onDelete,
  getHighlightProps,
}: MediaCoverageCardProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");
  const hp = getHighlightProps?.(item.id);

  return (
    <div
      {...hp}
      className={`bg-background-secondary border border-border rounded-lg overflow-hidden group ${
        hp?.className ?? ""
      }`}
    >
      <div className="h-36 bg-background-tertiary relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
            {t("noImage")}
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded font-medium">
            {t("featuredLabel")}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gold-400 mb-1">{item.mediaName}</p>
        <h3 className="font-medium text-foreground line-clamp-2">{item.title}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 bg-gold-500/10 text-gold-400 rounded">
            {t(`category.${item.category}`)}
          </span>
          <span className="text-xs text-foreground-secondary">
            {item.isPublished ? tc("published") : tc("draft")}
          </span>
        </div>
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
