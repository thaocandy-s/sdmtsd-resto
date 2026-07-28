"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { OrderableModule } from "@/lib/ordering-types";

// Shared drag & drop reorder hook. Handles optimistic cache updates against
// the react-query key, calls the shared /api/reorder endpoint, and rolls back
// on failure with a toast. Works for both flat and category-scoped modules.

interface UseReorderOptions<T> {
  module: OrderableModule;
  queryKey: unknown[];
  // Extracts the flat array of ordered rows from the cached query data.
  selectItems: (data: unknown) => T[];
  // Writes a reordered array back into the cached query data shape.
  applyItems: (data: unknown, items: T[]) => unknown;
  getId: (item: T) => string;
  // Category-scoped modules pass the categoryId of the scope being reordered.
  // For pages with several scopes (grouped lists) the scope can also be passed
  // per-call to `reorder(orderedIds, scopeValue)`.
  scopeValue?: string | null;
  successMessage?: string;
  errorMessage?: string;
}

export function useReorder<T>({
  module,
  queryKey,
  selectItems,
  applyItems,
  getId,
  scopeValue,
  successMessage = "Order updated",
  errorMessage = "Failed to update order",
}: UseReorderOptions<T>) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  // Guard against overlapping reorders clobbering each other.
  const inFlight = useRef(false);

  const reorder = useCallback(
    async (orderedIds: string[], scopeOverride?: string | null) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setIsSaving(true);

      const scope = scopeOverride !== undefined ? scopeOverride : scopeValue;
      const previous = queryClient.getQueryData(queryKey);

      // Optimistic update: reorder only the items within the affected scope,
      // preserving items from other scopes untouched.
      queryClient.setQueryData(queryKey, (data: unknown) => {
        if (data == null) return data;
        const items = selectItems(data);
        const affected = new Set(orderedIds);
        const byId = new Map(items.map((item) => [getId(item), item]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((item): item is T => item != null);
        const untouched = items.filter((item) => !affected.has(getId(item)));
        return applyItems(data, [...reordered, ...untouched]);
      });

      try {
        await api.post("/api/reorder", {
          module,
          orderedIds,
          scopeValue: scope ?? undefined,
        });
        toast.success(successMessage);
        queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        queryClient.setQueryData(queryKey, previous);
        toast.error(error instanceof Error ? error.message : errorMessage);
      } finally {
        inFlight.current = false;
        setIsSaving(false);
      }
    },
    [
      queryClient,
      queryKey,
      module,
      scopeValue,
      selectItems,
      applyItems,
      getId,
      successMessage,
      errorMessage,
    ]
  );

  return { reorder, isSaving };
}
