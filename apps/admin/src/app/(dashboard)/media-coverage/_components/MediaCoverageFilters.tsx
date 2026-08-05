import { useTranslations } from "next-intl";
import { CATEGORY_OPTIONS } from "./types";

interface MediaCoverageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onReorder: () => void;
}

export function MediaCoverageFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
  onReorder,
}: MediaCoverageFiltersProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");

  return (
    <div className="flex flex-col gap-3 mb-6 md:gap-4">
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full mb-1 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500 md:mb-0"
      />
      <div className="flex w-full flex-wrap gap-3 md:flex-nowrap md:gap-4">
        <select
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="min-w-0 flex-1 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 md:w-auto md:flex-none"
        >
          <option value="">{t("categoryFilter")}</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category.${cat}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onReorder}
          className="order-2 flex-1 inline-flex min-h-[44px] items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors md:order-3 md:min-h-0 md:flex-none"
        >
          {tc("reorder")}
        </button>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="order-3 w-full bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 md:order-2 md:w-auto"
        >
          <option value="">{t("statusFilter")}</option>
          <option value="published">{tc("published")}</option>
          <option value="draft">{tc("draft")}</option>
        </select>
      </div>
    </div>
  );
}
