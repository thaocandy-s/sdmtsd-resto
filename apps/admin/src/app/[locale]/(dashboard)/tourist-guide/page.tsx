"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { Place, Category } from "./_components/types";
import { PlaceFormModal } from "./_components/PlaceFormModal";
import { CategoryFormModal } from "./_components/CategoryFormModal";
import { PlaceList } from "./_components/PlaceList";
import { CategoryList } from "./_components/CategoryList";
import { GuideHeader } from "./_components/GuideHeader";
import { ConfirmModal } from "@/shared/components/confirm-modal";

export default function TouristGuidePage() {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");

  const [tab, setTab] = useState<"places" | "categories">("places");
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [placesPage, setPlacesPage] = useState(1);
  const [placesTotalPages, setPlacesTotalPages] = useState(1);
  const [placesTotal, setPlacesTotal] = useState(0);

  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesTotalPages, setCategoriesTotalPages] = useState(1);
  const [categoriesTotal, setCategoriesTotal] = useState(0);

  // Delete confirmation state
  const [deleteConfirmType, setDeleteConfirmType] = useState<"places" | "categories" | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllCategories();
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [placesPage]);

  useEffect(() => {
    loadCategories();
  }, [categoriesPage]);

  const loadAllCategories = async () => {
    try {
      const res = await api.get<{ data: Category[] }>("/api/tourist/categories?all=true");
      setAllCategories(res.data || []);
    } catch (error) {
      console.error("Load all categories error:", error);
    }
  };

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const pRes = await api.get<{
        data: Place[];
        meta: { totalPages: number; total: number };
      }>(`/api/tourist?page=${placesPage}&limit=10`);
      setPlaces(pRes.data || []);
      setPlacesTotalPages(pRes.meta?.totalPages || 1);
      setPlacesTotal(pRes.meta?.total || 0);
    } catch (error) {
      console.error("Load places error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cRes = await api.get<{
        data: Category[];
        meta: { totalPages: number; total: number };
      }>(`/api/tourist/categories?page=${categoriesPage}&limit=10`);
      setCategories(cRes.data || []);
      setCategoriesTotalPages(cRes.meta?.totalPages || 1);
      setCategoriesTotal(cRes.meta?.total || 0);
    } catch (error) {
      console.error("Load categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = () => {
    loadPlaces();
    loadCategories();
    loadAllCategories();
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmType || !deleteConfirmId) return;
    try {
      if (deleteConfirmType === "places") await api.delete(`/api/tourist/${deleteConfirmId}`);
      else await api.delete(`/api/tourist/categories/${deleteConfirmId}`);
      setDeleteConfirmType(null);
      setDeleteConfirmId(null);
      handleDataChange();
    } catch (error) {
      console.error("Delete error:", error);
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
        onDataChange={handleDataChange}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmType(null);
          setDeleteConfirmId(null);
        }}
      />
    </>
  );
}
