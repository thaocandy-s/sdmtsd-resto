import { useTranslations } from "next-intl";
import { CATEGORY_OPTIONS } from "./types";

interface MediaCoverageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
}

export function MediaCoverageFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
}: MediaCoverageFiltersProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500"
      />
      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
      >
        <option value="">{t("categoryFilter")}</option>
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat} value={cat}>
            {t(`category.${cat}`)}
          </option>
        ))}
      </select>
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
      >
        <option value="">{t("statusFilter")}</option>
        <option value="published">{tc("published")}</option>
        <option value="draft">{tc("draft")}</option>
      </select>
    </div>
  );
}
