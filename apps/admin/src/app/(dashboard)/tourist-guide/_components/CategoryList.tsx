import { useTranslations } from "next-intl";
import { OrderBadge } from "@/shared/components/sortable-list";
import { Category } from "./types";

interface CategoryListProps {
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  getHighlightProps,
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
    <div className="space-y-3">
      {categories.map((c, idx) => {
        const hp = getHighlightProps(c.id);
        return (
          <div
            key={c.id}
            {...hp}
            className={`bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between ${hp.className}`}
          >
            <div className="flex items-center gap-3">
              <OrderBadge order={idx + 1} />
              <div>
                <h3 className="font-medium text-foreground">{c.name}</h3>
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
      })}
    </div>
  );
}
