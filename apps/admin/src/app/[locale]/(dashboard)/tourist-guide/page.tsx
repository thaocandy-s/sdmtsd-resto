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

export default function TouristGuidePage() {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");

  const [tab, setTab] = useState<"places" | "categories">("places");
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get<{ data: Place[] }>("/api/tourist"),
        api.get<{ data: Category[] }>("/api/tourist/categories"),
      ]);
      setPlaces(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "places" | "categories", id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      if (type === "places") await api.delete(`/api/tourist/${id}`);
      else await api.delete(`/api/tourist/categories/${id}`);
      loadData();
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
        placesCount={places.length}
        categoriesCount={categories.length}
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
        <PlaceList
          places={places}
          onEdit={(p) => {
            setEditingId(p.id);
            setShowPlaceModal(true);
          }}
          onDelete={(id) => handleDelete("places", id)}
        />
      ) : (
        <CategoryList
          categories={categories}
          onEdit={(c) => {
            setEditingId(c.id);
            setShowCategoryModal(true);
          }}
          onDelete={(id) => handleDelete("categories", id)}
        />
      )}

      <PlaceFormModal
        isOpen={showPlaceModal}
        editingId={editingId}
        initialData={activeEditingPlace}
        categories={categories}
        onClose={() => {
          setShowPlaceModal(false);
          setEditingId(null);
        }}
        onDataChange={loadData}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        editingId={editingId}
        initialData={activeEditingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingId(null);
        }}
        onDataChange={loadData}
      />
    </>
  );
}
