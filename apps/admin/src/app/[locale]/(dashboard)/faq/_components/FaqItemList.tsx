import { useTranslations } from "next-intl";
import { FaqItem } from "./types";

interface FaqItemListProps {
  items: FaqItem[];
  onEdit: (item: FaqItem) => void;
  onDelete: (id: string) => void;
}

export function FaqItemList({ items, onEdit, onDelete }: FaqItemListProps) {
  const t = useTranslations("faq");
  const tc = useTranslations("common");

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noFaqs")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="bg-background-secondary border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{item.question}</h3>
              <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">{item.answer}</p>
              <div className="flex items-center gap-3 mt-2">
                {item.category && (
                  <span className="text-xs bg-background-tertiary text-foreground-secondary px-2 py-0.5 rounded">
                    {item.category.name}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    item.isPublished
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {item.isPublished ? tc("published") : tc("draft")}
                </span>
                <span className="text-xs text-foreground-secondary">
                  {t("orderLabel")}: {item.sortOrder}
                </span>
              </div>
            </div>
            <div className="flex gap-3 ml-4">
              <button
                onClick={() => onEdit(item)}
                className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
              >
                {tc("edit")}
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                {tc("delete")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
