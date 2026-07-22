"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { Drink, Category, FormData, emptyForm } from "./_components/types";
import { DrinkFormModal } from "./_components/DrinkFormModal";
import { CategoryManagerModal } from "./_components/CategoryManagerModal";
import { DrinkTable } from "./_components/DrinkTable";
import { ConfirmModal } from "@/shared/components/confirm-modal";

export default function DrinkMenuPage() {
  const t = useTranslations("drinkMenu");
  const tc = useTranslations("common");
  const [drinks, setDrinks] = useState<Drink[]>([]);
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

  // Drink Modal State
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

      const [drinksRes, catRes] = await Promise.all([
        api.get<{ data: Drink[]; meta: { totalPages: number; total: number } }>(
          `/api/drink?${params.toString()}`
        ),
        api.get<{ data: Category[] }>("/api/drink/categories"),
      ]);
      setDrinks(drinksRes.data || []);
      setTotalPages(drinksRes.meta?.totalPages || 1);
      setTotalItems(drinksRes.meta?.total || 0);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error("Load drinks error:", error);
    } finally {
      setLoading(false);
    }
  };

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
      sortOrder: "0",
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
      sortOrder: "0",
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

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/drink/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error("Delete drink error:", error);
    }
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            {t("manageCategories")}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            + {t("addDrink")}
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{t("categoryFilter")}</option>
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
          <option value="">{t("statusFilter")}</option>
          <option value="DRAFT">{tc("draft")}</option>
          <option value="PUBLISHED">{tc("published")}</option>
        </select>
      </div>

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
        title={tc("delete")}
        message={t("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
