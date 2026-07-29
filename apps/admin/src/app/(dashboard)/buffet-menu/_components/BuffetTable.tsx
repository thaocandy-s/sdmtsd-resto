import { useTranslations } from "next-intl";
import { Buffet } from "./types";
import { BuffetCard } from "./BuffetCard";

interface BuffetTableProps {
  buffets: Buffet[];
  loading: boolean;
  onEdit: (buffet: Buffet) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (buffet: Buffet) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function BuffetTable({
  buffets,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: BuffetTableProps) {
  const t = useTranslations("buffetMenu");
  const tc = useTranslations("common");

  if (loading) {
    return (
      <div className="space-y-3">
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-xl p-4 animate-pulse h-36"
            />
          ))}
        </div>
        {/* Table Skeleton */}
        <div className="hidden md:block space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (buffets.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-xl p-12 text-center">
        <p className="text-foreground-secondary">{t("noBuffets")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View (<768px): Card List */}
      <div className="block md:hidden space-y-3">
        {buffets.map((buffet) => (
          <BuffetCard
            key={buffet.id}
            buffet={buffet}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>

      {/* Tablet & Desktop Table View (>=768px) */}
      <div className="hidden md:block bg-background-secondary border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary w-16">
                  {t("imageLabel")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {t("nameLabel")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {t("priceLabel")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {t("durationLabel")}
                </th>
                {/* Visible only on Desktop (>=1024px) */}
                <th className="hidden lg:table-cell px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {t("groupSize")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {tc("status")}
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  {tc("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buffets.map((b) => {
                const groupSizeText =
                  b.minPeople || b.maxPeople
                    ? b.minPeople && b.maxPeople
                      ? t("groupSizeFormat", { min: b.minPeople!, max: b.maxPeople! })
                      : b.minPeople
                        ? t("minPeopleFormat", { min: b.minPeople! })
                        : t("maxPeopleFormat", { max: b.maxPeople! })
                    : "-";

                return (
                  <tr key={b.id} className="hover:bg-background-tertiary/50">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-tertiary">
                        {b.imageUrl ? (
                          <img
                            src={b.imageUrl}
                            alt={b.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
                            {t("noImage")}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name Column */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{b.name}</span>
                          {/* Desktop (>=1024px): Popular badge inline */}
                          {b.isPopular && (
                            <span className="hidden lg:inline-block text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded font-medium">
                              {t("popularLabel")}
                            </span>
                          )}
                        </div>

                        {/* Tablet (<1024px): Move Description, Popular Badge, and Group Size below Name */}
                        <div className="lg:hidden flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {b.isPopular && (
                              <span className="text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded font-medium">
                                {t("popularLabel")}
                              </span>
                            )}
                            <span className="text-xs text-foreground-tertiary font-medium">
                              {t("groupSize")}: {groupSizeText}
                            </span>
                          </div>
                          {b.description && (
                            <p className="text-xs text-foreground-tertiary line-clamp-1 max-w-xs">
                              {b.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="px-4 py-3 text-foreground text-sm whitespace-nowrap font-medium">
                      ¥{b.price.toLocaleString()}
                    </td>

                    {/* Duration Column */}
                    <td className="px-4 py-3 text-foreground-secondary text-sm whitespace-nowrap">
                      {t("durationFormat", { duration: b.duration })}
                    </td>

                    {/* Group Size Column (Desktop >=1024px only) */}
                    <td className="hidden lg:table-cell px-4 py-3 text-foreground-secondary text-sm">
                      {groupSizeText}
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          b.status === "PUBLISHED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {b.status === "PUBLISHED" ? tc("published") : tc("draft")}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(b)}
                          className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
                        >
                          {tc("edit")}
                        </button>
                        {onDuplicate && (
                          <button
                            onClick={() => onDuplicate(b)}
                            className="text-foreground-secondary hover:text-foreground text-sm font-medium transition-colors"
                          >
                            {t("duplicate")}
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(b.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          {tc("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && onPageChange && (
        <div className="bg-background-secondary border border-border rounded-xl md:rounded-b-lg md:rounded-t-none px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-foreground-secondary">
            {t("showingPage", { page: currentPage, totalPages, total: totalItems })}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              {t("previous")}
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
