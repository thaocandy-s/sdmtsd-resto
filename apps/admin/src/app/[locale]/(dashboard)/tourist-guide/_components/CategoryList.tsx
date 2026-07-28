import { useTranslations } from "next-intl";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { Category } from "./types";

interface CategoryListProps {
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
  disabled?: boolean;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onReorder,
  getHighlightProps,
  disabled,
}: CategoryListProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");

  if (categories.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noCategories")}</p>
      </div>
    );
  }

  return (
    <SortableList
      items={categories}
      onReorder={onReorder}
      disabled={disabled}
      className="space-y-3"
      renderItem={(c, idx, handle) => {
        const hp = getHighlightProps(c.id);
        return (
          <div
            {...hp}
            className={`bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between ${hp.className}`}
          >
            <div className="flex items-center gap-3">
              {handle}
              <OrderBadge order={idx + 1} />
              <div>
                <h3 className="font-medium text-foreground">{c.name}</h3>
                <p className="text-sm text-foreground-secondary">{c.slug}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onEdit(c)}
                className="text-gold-400 hover:text-gold-300 text-sm"
              >
                {tc("edit")}
              </button>
              <button
                onClick={() => onDelete(c.id)}
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
