"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { FaqItem } from "./types";

interface FaqItemListProps {
  items: FaqItem[];
  onEdit: (item: FaqItem) => void;
  onDelete: (id: string) => void;
  // Reorder within a single category scope.
  onReorder: (categoryId: string | null, orderedIds: string[]) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
}

export function FaqItemList({
  items,
  onEdit,
  onDelete,
  onReorder,
  getHighlightProps,
}: FaqItemListProps) {
  const t = useTranslations("faq");
  const tc = useTranslations("common");

  // Ordering is independent per category, so drag & drop is grouped by
  // category and only reorders items within that group.
  const groups = useMemo(() => {
    const map = new Map<string | null, { name: string; items: FaqItem[] }>();
    for (const item of items) {
      const key = item.category?.id ?? null;
      if (!map.has(key)) {
        map.set(key, { name: item.category?.name ?? t("uncategorized"), items: [] });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.entries());
  }, [items, t]);

  if (items.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noFaqs")}</p>
      </div>
    );
  }

  const renderCard = (item: FaqItem, index: number, handle: React.ReactNode) => {
    const hp = getHighlightProps(item.id);
    return (
      <div
        {...hp}
        className={`bg-background-secondary border border-border rounded-lg p-4 ${hp.className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="pt-0.5">{handle}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <OrderBadge order={index + 1} />
                <h3 className="font-medium text-foreground truncate">{item.question}</h3>
              </div>
              <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">{item.answer}</p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    item.isPublished
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {item.isPublished ? tc("published") : tc("draft")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 ml-4 shrink-0">
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
    );
  };

  return (
    <div className="space-y-6">
      {groups.map(([categoryId, group]) => (
        <div key={categoryId ?? "uncategorized"}>
          <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide mb-3">
            {group.name}
          </h4>
          <SortableList
            items={group.items}
            onReorder={(orderedIds) => onReorder(categoryId, orderedIds)}
            className="space-y-3"
            renderItem={renderCard}
          />
        </div>
      ))}
    </div>
  );
}
