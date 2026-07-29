"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useReorder } from "@/shared/hooks/use-reorder";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import { Drink, Category, FormData, emptyForm } from "./_components/types";
import { DrinkMenuHeader } from "./_components/DrinkMenuHeader";
import { DrinkFilters } from "./_components/DrinkFilters";
import { DrinkFormModal } from "./_components/DrinkFormModal";
import { CategoryManagerModal } from "./_components/CategoryManagerModal";
import { DrinkTable } from "./_components/DrinkTable";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";

export default function DrinkMenuPage() {
  const t = useTranslations("drinkMenu");
  const tc = useTranslations("common");
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

  // Drink Modal State
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

  const drinksQuery = useQuery({
    queryKey: [
      "drinks",
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
      return api.get<{ data: Drink[]; meta: { totalPages: number; total: number } }>(
        `/api/drink?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["drink-categories"],
    queryFn: () => api.get<{ data: Category[] }>("/api/drink/categories"),
    staleTime: 30 * 60 * 1000,
  });

  const drinks = drinksQuery.data?.data ?? [];
  const totalPages = drinksQuery.data?.meta?.totalPages ?? 1;
  const totalItems = drinksQuery.data?.meta?.total ?? 0;
  const categories = categoriesQuery.data?.data ?? [];
  const loading = drinksQuery.isPending;

  const highlight = useHighlightNew();

  const { reorder: reorderCategories } = useReorder<Category>({
    module: "drink-category",
    queryKey: ["drink-categories"],
    selectItems: (data) => (data as { data: Category[] }).data,
    applyItems: (data, next) => ({ ...(data as object), data: next }),
    getId: (item) => item.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/drink/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drinks"] });
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      console.error("Delete drink error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
    },
  });

  const handleEdit = (drink: Drink) => {
    setEditingId(drink.id);
    setForm({
      name: drink.name,
      slug: drink.slug,
      description: drink.description || "",
      price: drink.price.toString(),
      categoryId: drink.category.id,
      imageUrl: drink.imageUrl || "",
      isPopular: drink.isPopular,
      status: drink.status,
      position: "",
      alcoholPercent:
        drink.alcoholPercent !== null && drink.alcoholPercent !== undefined
          ? drink.alcoholPercent.toString()
          : "",
      volume: drink.volume || "",
    });
    setShowModal(true);
  };

  const handleDuplicate = (drink: Drink) => {
    setEditingId(null);
    setForm({
      name: `${drink.name} (Copy)`,
      slug: `${drink.slug}-copy`,
      description: drink.description || "",
      price: drink.price.toString(),
      categoryId: drink.category.id,
      imageUrl: drink.imageUrl || "",
      isPopular: drink.isPopular,
      status: "DRAFT",
      position: "",
      alcoholPercent:
        drink.alcoholPercent !== null && drink.alcoholPercent !== undefined
          ? drink.alcoholPercent.toString()
          : "",
      volume: drink.volume || "",
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
      <DrinkMenuHeader
        onManageCategories={() => setShowCategoryModal(true)}
        onReorder={() => setShowReorderModal(true)}
        onAddDrink={() => {
          setEditingId(null);
          setForm(emptyForm);
          setShowModal(true);
        }}
      />

      <DrinkFilters
        search={search}
        onSearchChange={setSearch}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        categories={categories}
      />

      <DrinkTable
        drinks={drinks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      <DrinkFormModal
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
          queryClient.invalidateQueries({ queryKey: ["drinks"] });
          if (createdId) highlight.flash(createdId);
          toast.success(editingId ? tc("saved") : tc("created"));
        }}
      />

      <CategoryManagerModal
        isOpen={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onReorder={reorderCategories}
        getHighlightProps={highlight.getHighlightProps}
        onDataChange={() => {
          queryClient.invalidateQueries({ queryKey: ["drink-categories"] });
          queryClient.invalidateQueries({ queryKey: ["drinks"] });
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />

      <ReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        module="drink"
        scopes={categories.map((c) => ({ value: c.id, label: c.name }))}
        initialScope={categories.find((c) => c.slug === filterCategory)?.id}
        invalidateKeys={[["drinks"]]}
      />
    </>
  );
}
