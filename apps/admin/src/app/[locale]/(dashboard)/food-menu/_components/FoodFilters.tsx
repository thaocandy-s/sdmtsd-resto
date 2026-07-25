import { useTranslations } from "next-intl";
import { Category } from "./types";

interface FoodFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  categories: Category[];
}

export function FoodFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
  categories,
}: FoodFiltersProps) {
  const tFood = useTranslations("foodMenu");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        placeholder={tFood("searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500"
      />
      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
      >
        <option value="">{tFood("categoryFilter")}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
      >
        <option value="">{tFood("statusFilter")}</option>
        <option value="DRAFT">{tCommon("draft")}</option>
        <option value="PUBLISHED">{tCommon("published")}</option>
        <option value="ARCHIVED">{tCommon("archived")}</option>
      </select>
    </div>
  );
}
