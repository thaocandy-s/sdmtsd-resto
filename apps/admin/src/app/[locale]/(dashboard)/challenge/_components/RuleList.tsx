import { useTranslations } from "next-intl";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { Rule } from "./types";

interface RuleListProps {
  rules: Rule[];
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
}

export function RuleList({ rules, onEdit, onDelete, onReorder, getHighlightProps }: RuleListProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  if (rules.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noRules")}</p>
      </div>
    );
  }

  return (
    <SortableList
      items={rules}
      onReorder={onReorder}
      className="space-y-3"
      renderItem={(rule, idx, handle) => {
        const hp = getHighlightProps(rule.id);
        return (
          <div
            {...hp}
            className={`bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between ${hp.className}`}
          >
            <div className="flex items-center gap-3">
              {handle}
              <OrderBadge order={idx + 1} />
              <div>
                <h3 className="font-medium text-foreground">{rule.title}</h3>
                <p className="text-sm text-foreground-secondary mt-0.5">{rule.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  rule.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {rule.isActive ? tc("active") : tc("inactive")}
              </span>
              <button
                onClick={() => onEdit(rule)}
                className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
              >
                {tc("edit")}
              </button>
              <button
                onClick={() => onDelete(rule.id)}
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
