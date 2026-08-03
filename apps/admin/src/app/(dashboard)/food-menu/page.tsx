"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useReorder } from "@/shared/hooks/use-reorder";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import { Food, Category, FormData, emptyForm } from "./_components/types";
import { FoodMenuHeader } from "./_components/FoodMenuHeader";
import { FoodFilters } from "./_components/FoodFilters";
import { FoodFormModal } from "./_components/FoodFormModal";
import { CategoryManagerModal } from "./_components/CategoryManagerModal";
import { FoodTable } from "./_components/FoodTable";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";

export default function FoodMenuPage() {
  const tFood = useTranslations("foodMenu");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Food Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Reorder Mode dialog state
  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterCategory, filterStatus]);

  const foodsQuery = useQuery({
    queryKey: [
      "foods",
      {
        page: currentPage,
        search: debouncedSearch,
        category: filterCategory,
        status: filterStatus,
      },
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", currentPage.toString());
      params.set("limit", "10");
      return api.get<{ data: Food[]; meta: { totalPages: number; total: number } }>(
        `/api/menu?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["food-categories"],
    queryFn: () => api.get<{ data: Category[] }>("/api/menu/categories"),
    staleTime: 30 * 60 * 1000,
  });

  const foods = foodsQuery.data?.data ?? [];
  const totalPages = foodsQuery.data?.meta?.totalPages ?? 1;
  const totalItems = foodsQuery.data?.meta?.total ?? 0;
  const categories = categoriesQuery.data?.data ?? [];
  const loading = foodsQuery.isPending;

  const highlight = useHighlightNew();

  const { reorder: reorderCategories } = useReorder<Category>({
    module: "food-category",
    queryKey: ["food-categories"],
    selectItems: (data) => (data as { data: Category[] }).data,
    applyItems: (data, next) => ({ ...(data as object), data: next }),
    getId: (item) => item.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/menu/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      setDeleteConfirmId(null);
      showSuccessToast(toastMessages.deleted);
    },
    onError: (error) => {
      console.error("Delete food error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    },
  });

  const handleEdit = (food: Food) => {
    setEditingId(food.id);
    setForm({
      name: food.name,
      slug: food.slug,
      description: food.description || "",
      price: food.price.toString(),
      originalPrice: food.originalPrice?.toString() || "",
      categoryId: food.category?.id || "",
      imageUrl: food.imageUrl || "",
      isPopular: food.isPopular,
      isRecommended: food.isRecommended,
      ingredients: food.ingredients || "",
      calories: food.calories?.toString() || "",
      status: food.status,
      position: "",
    });
    setShowModal(true);
  };

  const handleDuplicate = (food: Food) => {
    setEditingId(null);
    setForm({
      name: `${food.name} (Copy)`,
      slug: `${food.slug}-copy`,
      description: food.description || "",
      price: food.price.toString(),
      originalPrice: food.originalPrice?.toString() || "",
      categoryId: food.category?.id || "",
      imageUrl: food.imageUrl || "",
      isPopular: food.isPopular,
      isRecommended: food.isRecommended,
      ingredients: food.ingredients || "",
      calories: food.calories?.toString() || "",
      status: "DRAFT",
      position: "",
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    setDeleteError("");
    deleteMutation.mutate(deleteConfirmId);
  };

  return (
    <>
      <FoodMenuHeader
        onManageCategories={() => setShowCategoryModal(true)}
        onReorder={() => setShowReorderModal(true)}
        onAddFood={() => {
          setEditingId(null);
          setForm(emptyForm);
          setShowModal(true);
        }}
      />

      <FoodFilters
        search={search}
        onSearchChange={setSearch}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        categories={categories}
      />

      <FoodTable
        foods={foods}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      <FoodFormModal
        isOpen={showModal}
        editingId={editingId}
        initialForm={form}
        categories={categories}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
        }}
        onSubmitSuccess={(createdId) => {
          setShowModal(false);
          setEditingId(null);
          setForm(emptyForm);
          queryClient.invalidateQueries({ queryKey: ["foods"] });
          if (createdId) highlight.flash(createdId);
          showSuccessToast(editingId ? tCommon("saved") : tCommon("created"));
        }}
      />

      <CategoryManagerModal
        isOpen={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onReorder={reorderCategories}
        getHighlightProps={highlight.getHighlightProps}
        onDataChange={() => {
          queryClient.invalidateQueries({ queryKey: ["food-categories"] });
          queryClient.invalidateQueries({ queryKey: ["foods"] });
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tCommon("delete")}
        message={tFood("deleteConfirm")}
        error={deleteError}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />

      <ReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        module="food"
        scopes={categories.map((c) => ({ value: c.id, label: c.name }))}
        initialScope={categories.find((c) => c.slug === filterCategory)?.id}
        invalidateKeys={[["foods"]]}
      />
    </>
  );
}
