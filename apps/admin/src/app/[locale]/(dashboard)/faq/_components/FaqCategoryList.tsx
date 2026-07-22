import { useTranslations } from "next-intl";
import { FaqCategory } from "./types";

interface FaqCategoryListProps {
  categories: FaqCategory[];
  onEdit: (category: FaqCategory) => void;
  onDelete: (id: string) => void;
}

export function FaqCategoryList({ categories, onEdit, onDelete }: FaqCategoryListProps) {
  const t = useTranslations("faq");
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
      {categories.map((c) => (
        <div
          key={c.id}
          className="bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="font-medium text-foreground">{c.name}</h3>
            <p className="text-sm text-foreground-secondary">
              {c.slug} · {t("orderLabel")}: {c.sortOrder}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(c)}
              className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
            >
              {tc("edit")}
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              {tc("delete")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
