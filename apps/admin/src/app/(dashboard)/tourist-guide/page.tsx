"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import { Place, Category } from "./_components/types";
import { PlaceFormModal } from "./_components/PlaceFormModal";
import { CategoryFormModal } from "./_components/CategoryFormModal";
import { PlaceList } from "./_components/PlaceList";
import { CategoryList } from "./_components/CategoryList";
import { GuideHeader } from "./_components/GuideHeader";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";

export default function TouristGuidePage() {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"places" | "categories">("places");

  // Pagination states
  const [placesPage, setPlacesPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  // Delete confirmation state
  const [deleteConfirmType, setDeleteConfirmType] = useState<"places" | "categories" | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Reorder Mode dialog state (module follows the active tab)
  const [showReorderModal, setShowReorderModal] = useState(false);

  // Full category list for the place form select
  const allCategoriesQuery = useQuery({
    queryKey: ["tour-categories", "all"],
    queryFn: () => api.get<{ data: Category[] }>("/api/tourist/categories?all=true"),
    staleTime: 30 * 60 * 1000,
  });

  const placesQuery = useQuery({
    queryKey: ["tour-places", { page: placesPage }],
    queryFn: () =>
      api.get<{ data: Place[]; meta: { totalPages: number; total: number } }>(
        `/api/tourist?page=${placesPage}&limit=10`
      ),
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["tour-categories", { page: categoriesPage }],
    queryFn: () =>
      api.get<{ data: Category[]; meta: { totalPages: number; total: number } }>(
        `/api/tourist/categories?page=${categoriesPage}&limit=10`
      ),
    placeholderData: keepPreviousData,
  });

  const places = placesQuery.data?.data ?? [];
  const placesTotalPages = placesQuery.data?.meta?.totalPages ?? 1;
  const placesTotal = placesQuery.data?.meta?.total ?? 0;
  const categories = categoriesQuery.data?.data ?? [];
  const categoriesTotalPages = categoriesQuery.data?.meta?.totalPages ?? 1;
  const categoriesTotal = categoriesQuery.data?.meta?.total ?? 0;
  const allCategories = allCategoriesQuery.data?.data ?? [];
  const loading = tab === "places" ? placesQuery.isPending : categoriesQuery.isPending;

  const categoryHighlight = useHighlightNew();

  const handleDataChange = () => {
    queryClient.invalidateQueries({ queryKey: ["tour-places"] });
    queryClient.invalidateQueries({ queryKey: ["tour-categories"] });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmType || !deleteConfirmId) return;
    setDeleteError("");
    try {
      if (deleteConfirmType === "places") await api.delete(`/api/tourist/${deleteConfirmId}`);
      else await api.delete(`/api/tourist/categories/${deleteConfirmId}`);
      setDeleteConfirmType(null);
      setDeleteConfirmId(null);
      handleDataChange();
      showSuccessToast(toastMessages.deleted);
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    }
  };

  const activeEditingPlace = editingId ? places.find((p) => p.id === editingId) || null : null;
  const activeEditingCategory = editingId
    ? categories.find((c) => c.id === editingId) || null
    : null;

  return (
    <>
      <GuideHeader
        tab={tab}
        setTab={setTab}
        placesCount={placesTotal}
        categoriesCount={categoriesTotal}
        onAdd={() => {
          setEditingId(null);
          if (tab === "places") {
            setShowPlaceModal(true);
          } else {
            setShowCategoryModal(true);
          }
        }}
        onReorder={() => setShowReorderModal(true)}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "places" ? (
        <>
          <PlaceList
            places={places}
            onEdit={(p) => {
              setEditingId(p.id);
              setShowPlaceModal(true);
            }}
            onDelete={(id) => {
              setDeleteConfirmType("places");
              setDeleteConfirmId(id);
            }}
          />

          {placesTotalPages > 1 && (
            <div className="mt-6 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-foreground-secondary">
                {t("showingPage", {
                  page: placesPage,
                  totalPages: placesTotalPages,
                  total: placesTotal,
                })}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPlacesPage(Math.max(placesPage - 1, 1))}
                  disabled={placesPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("previous")}
                </button>
                <button
                  onClick={() => setPlacesPage(Math.min(placesPage + 1, placesTotalPages))}
                  disabled={placesPage === placesTotalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <CategoryList
            categories={categories}
            onEdit={(c) => {
              setEditingId(c.id);
              setShowCategoryModal(true);
            }}
            onDelete={(id) => {
              setDeleteConfirmType("categories");
              setDeleteConfirmId(id);
            }}
            getHighlightProps={categoryHighlight.getHighlightProps}
          />

          {categoriesTotalPages > 1 && (
            <div className="mt-6 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-foreground-secondary">
                {t("showingPage", {
                  page: categoriesPage,
                  totalPages: categoriesTotalPages,
                  total: categoriesTotal,
                })}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setCategoriesPage(Math.max(categoriesPage - 1, 1))}
                  disabled={categoriesPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("previous")}
                </button>
                <button
                  onClick={() =>
                    setCategoriesPage(Math.min(categoriesPage + 1, categoriesTotalPages))
                  }
                  disabled={categoriesPage === categoriesTotalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <PlaceFormModal
        isOpen={showPlaceModal}
        editingId={editingId}
        initialData={activeEditingPlace}
        categories={allCategories}
        onClose={() => {
          setShowPlaceModal(false);
          setEditingId(null);
        }}
        onDataChange={handleDataChange}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        editingId={editingId}
        initialData={activeEditingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingId(null);
        }}
        onDataChange={(createdId) => {
          handleDataChange();
          if (createdId) categoryHighlight.flash(createdId);
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmType(null);
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />

      {tab === "places" ? (
        <ReorderModal
          isOpen={showReorderModal}
          onClose={() => setShowReorderModal(false)}
          module="tour-place"
          scopes={allCategories.map((c) => ({ value: c.id, label: c.name }))}
          invalidateKeys={[["tour-places"]]}
        />
      ) : (
        <ReorderModal
          isOpen={showReorderModal}
          onClose={() => setShowReorderModal(false)}
          module="tour-category"
          invalidateKeys={[["tour-categories"]]}
        />
      )}
    </>
  );
}
