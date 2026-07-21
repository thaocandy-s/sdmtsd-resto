import { Drink } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";
import { StatusBadge } from "./StatusBadge";
import { DrinkBadges } from "./DrinkBadges";
import { DrinkCard } from "./DrinkCard";

interface DrinkTableProps {
  drinks: Drink[];
  loading: boolean;
  onEdit: (drink: Drink) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (drink: Drink) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function DrinkTable({
  drinks,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: DrinkTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-xl p-4 animate-pulse h-32"
            />
          ))}
        </div>
        {/* Table skeleton */}
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

  if (drinks.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-xl p-12 text-center">
        <p className="text-foreground-secondary">No drinks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View (<768px): Card List */}
      <div className="block md:hidden space-y-3">
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>

      {/* Tablet (768px–1023px) and Desktop (>=1024px) Table View */}
      <div className="hidden md:block bg-background-secondary border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary w-16">
                  Image
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Name</th>
                <th className="hidden lg:table-cell px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Price</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drinks.map((drink) => (
                <tr key={drink.id} className="hover:bg-background-tertiary/50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-tertiary">
                      {drink.imageUrl ? (
                        <img
                          src={drink.imageUrl}
                          alt={drink.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
                          No img
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name column: Displays name, badges, and category on tablet (<1024px) */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{drink.name}</span>
                        <DrinkBadges
                          isPopular={drink.isPopular}
                          alcoholPercent={drink.alcoholPercent}
                          volume={drink.volume}
                        />
                      </div>
                      {/* Show category below drink name only on tablet (md:block lg:hidden) */}
                      {drink.category?.name && (
                        <span className="lg:hidden text-xs text-foreground-tertiary font-medium">
                          {drink.category.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category column (Visible on desktop >=1024px) */}
                  <td className="hidden lg:table-cell px-4 py-3 text-foreground-secondary">
                    {drink.category?.name}
                  </td>

                  <td className="px-4 py-3 text-foreground text-sm whitespace-nowrap">
                    {formatPriceWithTax(drink.price)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={drink.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(drink)}
                        className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      {onDuplicate && (
                        <button
                          onClick={() => onDuplicate(drink)}
                          className="text-foreground-secondary hover:text-foreground text-sm font-medium transition-colors"
                        >
                          Duplicate
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(drink.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="bg-background-secondary border border-border rounded-xl md:rounded-b-lg md:rounded-t-none px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-foreground-secondary">
            Showing page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span> ({totalItems} items)
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
