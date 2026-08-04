import { useTranslations } from "next-intl";
import { MediaOutlet } from "./types";

interface MediaOutletCardProps {
  item: MediaOutlet;
  onEdit: (item: MediaOutlet) => void;
  onDelete: (id: string) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function MediaOutletCard({
  item,
  onEdit,
  onDelete,
  getHighlightProps,
}: MediaOutletCardProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");
  const hp = getHighlightProps?.(item.id);

  return (
    <div
      {...hp}
      className={`bg-background-secondary border border-border rounded-lg overflow-hidden p-4 flex flex-col items-center ${
        hp?.className ?? ""
      }`}
    >
      <div className="h-12 w-full flex items-center justify-center mb-3">
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.name}
            className="max-h-10 max-w-full object-contain opacity-80"
          />
        ) : (
          <span className="text-foreground-tertiary text-xs">{t("noImage")}</span>
        )}
      </div>
      <h3 className="font-medium text-foreground text-sm text-center">{item.name}</h3>
      <p className="text-xs text-foreground-secondary mt-1">
        {item.isActive ? tc("published") : tc("draft")}
      </p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onEdit(item)} className="text-gold-400 hover:text-gold-300 text-xs">
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
  );
}
