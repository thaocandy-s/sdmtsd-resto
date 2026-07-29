"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { OrderableModule } from "@/lib/ordering-types";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { FormError } from "@/shared/components/form-error";

// Dedicated Reorder Mode used by every ordered admin module.
// Normal list views stay paginated/filtered; this dialog loads the COMPLETE
// ordered dataset of one scope (whole list, or one category for scoped
// modules) from GET /api/reorder, lets the admin drag & drop (desktop pointer,
// mobile long-press, keyboard — with auto-scroll near the edges), and saves
// the entire new order in a single POST /api/reorder call.

interface ReorderEntry {
  id: string;
  label: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ReorderScopeOption {
  value: string;
  label: string;
}

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: OrderableModule;
  /** Dialog heading; defaults to the shared "表示順の変更" label. */
  title?: string;
  /** Category options for scoped modules (food, drink, faq, tour-place). */
  scopes?: ReorderScopeOption[];
  initialScope?: string;
  /** react-query keys to invalidate after a successful save. */
  invalidateKeys?: unknown[][];
}

// Above this row count rows are lazily rendered via CSS content-visibility,
// which keeps large lists cheap without breaking dnd-kit's sortable context.
const LAZY_RENDER_THRESHOLD = 80;

export function ReorderModal({
  isOpen,
  onClose,
  module,
  title,
  scopes,
  initialScope,
  invalidateKeys = [],
}: ReorderModalProps) {
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const isScoped = scopes !== undefined;
  const [scope, setScope] = useState(initialScope ?? "");
  const [ordered, setOrdered] = useState<ReorderEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reset scope + errors each time the dialog opens.
  useEffect(() => {
    if (isOpen) {
      setScope(initialScope ?? "");
      setSaveError("");
    }
  }, [isOpen, initialScope]);

  const itemsQuery = useQuery({
    queryKey: ["reorder-items", module, isScoped ? scope : null],
    enabled: isOpen && (!isScoped || !!scope),
    // Always reorder against the freshest full dataset.
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: () => {
      const params = new URLSearchParams({ module });
      if (isScoped && scope) params.set("scopeValue", scope);
      return api.get<{ data: { items: ReorderEntry[] } }>(`/api/reorder?${params.toString()}`);
    },
  });

  const serverItems = useMemo(() => itemsQuery.data?.data.items ?? [], [itemsQuery.data]);

  // Seed the local drag & drop order whenever a fresh dataset arrives.
  useEffect(() => {
    setOrdered(serverItems);
    setSaveError("");
  }, [serverItems]);

  const isDirty = useMemo(() => {
    if (ordered.length !== serverItems.length) return false;
    return ordered.some((item, index) => item.id !== serverItems[index]?.id);
  }, [ordered, serverItems]);

  if (!isOpen) return null;

  const handleReorder = (orderedIds: string[]) => {
    const byId = new Map(ordered.map((item) => [item.id, item]));
    setOrdered(orderedIds.map((id) => byId.get(id)).filter((i): i is ReorderEntry => i != null));
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      await api.post("/api/reorder", {
        module,
        orderedIds: ordered.map((item) => item.id),
        scopeValue: isScoped ? scope : undefined,
      });
      toast.success(tc("orderUpdated"));
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      queryClient.invalidateQueries({ queryKey: ["reorder-items", module] });
      onClose();
    } catch (error) {
      // 409 = list changed underneath us; refetch so the admin retries fresh.
      setSaveError(error instanceof Error ? error.message : tc("orderUpdateFailed"));
      itemsQuery.refetch();
    } finally {
      setIsSaving(false);
    }
  };

  const lazyRows = ordered.length > LAZY_RENDER_THRESHOLD;
  const showList = !isScoped || !!scope;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-background-secondary border border-border rounded-lg max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">{title ?? tc("reorderTitle")}</h3>
          <p className="text-sm text-foreground-secondary mt-1">{tc("reorderHint")}</p>

          {isScoped && (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="mt-4 w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-gold-500 text-sm min-h-[44px]"
            >
              <option value="">{tc("reorderSelectCategory")}</option>
              {scopes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scrollable list area — dnd-kit auto-scrolls it while dragging. */}
        <div className="flex-1 overflow-y-auto p-4">
          {!showList ? (
            <p className="text-sm text-foreground-secondary text-center py-8">
              {tc("reorderSelectCategory")}
            </p>
          ) : itemsQuery.isPending || itemsQuery.isFetching ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-background-tertiary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : itemsQuery.isError ? (
            <FormError message={tc("orderUpdateFailed")} />
          ) : ordered.length === 0 ? (
            <p className="text-sm text-foreground-secondary text-center py-8">
              {tc("reorderEmpty")}
            </p>
          ) : (
            <SortableList
              items={ordered}
              onReorder={handleReorder}
              disabled={isSaving}
              className="space-y-2"
              renderItem={(item, index, handle) => (
                <div
                  className="bg-background-tertiary border border-border rounded-lg p-2.5 flex items-center gap-3"
                  style={
                    lazyRows
                      ? { contentVisibility: "auto", containIntrinsicSize: "56px" }
                      : undefined
                  }
                >
                  {handle}
                  <OrderBadge order={index + 1} />
                  {item.imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-background shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <span className="flex-1 min-w-0 font-medium text-foreground truncate text-sm">
                    {item.label}
                  </span>
                </div>
              )}
            />
          )}
        </div>

        <div className="p-4 border-t border-border">
          {saveError && (
            <div className="mb-3">
              <FormError message={saveError} />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-background-tertiary hover:bg-background border border-border text-foreground rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {tc("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-background rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? tc("saving") : tc("saveOrder")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
