import { Drink } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";

interface DrinkTableProps {
  drinks: Drink[];
  loading: boolean;
  onEdit: (drink: Drink) => void;
  onDelete: (id: string) => void;
}

export function DrinkTable({ drinks, loading, onEdit, onDelete }: DrinkTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-background-secondary border border-border rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-background-tertiary rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (drinks.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">No drinks found</p>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Name</th>
            <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Category</th>
            <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Price</th>
            <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
            <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {drinks.map((drink) => (
            <tr key={drink.id} className="hover:bg-background-tertiary/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{drink.name}</span>
                  {drink.isPopular && (
                    <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded">
                      Popular
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-foreground-secondary">{drink.category.name}</td>
              <td className="px-4 py-3 text-foreground text-sm">
                {formatPriceWithTax(drink.price)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    drink.status === "PUBLISHED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {drink.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(drink)}
                    className="text-gold-400 hover:text-gold-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(drink.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
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
  );
}
