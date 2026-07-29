"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { taxRateFromPercent } from "@resto-hub/utils";

// Shared lookup of the configured consumption tax rate for price displays.
// Returns a fraction (e.g. 0.1 for 10%) ready for formatPriceWithTax.
// React Query dedupes the request across every component that renders prices.
export function useTaxRate(): number {
  const query = useQuery({
    queryKey: ["settings", "tax-rate"],
    queryFn: () => api.get<{ data: { taxRate: number } }>("/api/settings/tax-rate"),
    staleTime: 5 * 60 * 1000,
  });

  return taxRateFromPercent(query.data?.data?.taxRate);
}
