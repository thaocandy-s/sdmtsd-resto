"use client";

import { useTranslations } from "next-intl";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { FaqCategory } from "./types";

interface FaqCategoryListProps {
  categories: FaqCategory[];
  onEdit: (category: FaqCategory) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
}

export function FaqCategoryList({
  categories,
  onEdit,
  onDelete,
  onReorder,
  getHighlightProps,
}: FaqCategoryListProps) {
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
    <SortableList
      items={categories}
      onReorder={onReorder}
      className="space-y-3"
      renderItem={(c, index, handle) => {
        const hp = getHighlightProps(c.id);
        return (
          <div
            {...hp}
            className={`bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between gap-3 ${hp.className}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {handle}
              <OrderBadge order={index + 1} />
              <div className="min-w-0">
                <h3 className="font-medium text-foreground truncate">{c.name}</h3>
                <p className="text-sm text-foreground-secondary truncate">{c.slug}</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
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
        );
      }}
    />
  );
}
