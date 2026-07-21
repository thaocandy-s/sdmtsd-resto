"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Drink, Category, FormData, emptyForm } from "./_components/types";
import { DrinkFormModal } from "./_components/DrinkFormModal";
import { CategoryManagerModal } from "./_components/CategoryManagerModal";
import { DrinkTable } from "./_components/DrinkTable";

export default function DrinkMenuPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Drink Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [drinksRes, catRes] = await Promise.all([
        api.get<{ data: Drink[]; categories: Category[] }>("/api/drink?limit=100"),
        api.get<{ data: Category[] }>("/api/drink/categories"),
      ]);
      setDrinks(drinksRes.data || []);
      setCategories(catRes.data || drinksRes.categories || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/drink/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete drink error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Drink Menu</h2>
          <p className="text-foreground-secondary mt-1">Manage drink items and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Manage Categories
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
            className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Drink
          </button>
        </div>
      </header>

      <DrinkTable drinks={drinks} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

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
    </>
  );
}
