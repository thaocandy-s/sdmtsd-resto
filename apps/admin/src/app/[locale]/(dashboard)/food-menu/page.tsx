"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { Food, Category, FormData, emptyForm } from "./_components/types";
import { FoodFormModal } from "./_components/FoodFormModal";
import { CategoryManagerModal } from "./_components/CategoryManagerModal";
import { FoodTable } from "./_components/FoodTable";
import { ConfirmModal } from "@/shared/components/confirm-modal";

export default function FoodMenuPage() {
  const tFood = useTranslations("foodMenu");
  const tCommon = useTranslations("common");

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Food Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus]);

  useEffect(() => {
    loadData();
  }, [currentPage, search, filterCategory, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      const [foodsRes, catRes] = await Promise.all([
        api.get<{ data: Food[]; meta: { totalPages: number; total: number } }>(
          `/api/menu?${params.toString()}`
        ),
        api.get<{ data: Category[] }>("/api/menu/categories"),
      ]);
      setFoods(foodsRes.data || []);
      setTotalPages(foodsRes.meta?.totalPages || 1);
      setTotalItems(foodsRes.meta?.total || 0);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error("Load foods error:", error);
    } finally {
      setLoading(false);
    }
  };

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
      status: food.status,
      sortOrder: food.sortOrder.toString(),
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
      status: "DRAFT",
      sortOrder: food.sortOrder.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/menu/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error("Delete food error:", error);
    }
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{tFood("title")}</h2>
          <p className="text-foreground-secondary mt-1">{tFood("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            {tFood("manageCategories")}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            + {tFood("addFood")}
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={tFood("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{tFood("categoryFilter")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{tFood("statusFilter")}</option>
          <option value="DRAFT">{tCommon("draft")}</option>
          <option value="PUBLISHED">{tCommon("published")}</option>
          <option value="ARCHIVED">{tCommon("archived")}</option>
        </select>
      </div>

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
        onSubmitSuccess={() => {
          setShowModal(false);
          setEditingId(null);
          setForm(emptyForm);
          loadData();
        }}
      />

      <CategoryManagerModal
        isOpen={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onDataChange={() => {
          loadData();
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tCommon("delete")}
        message={tFood("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
