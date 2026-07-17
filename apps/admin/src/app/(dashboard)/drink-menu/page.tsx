"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { ImageUpload } from "@/shared/components/image-upload";

interface Drink {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  status: string;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type FormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isPopular: boolean;
  status: string;
  sortOrder: string;
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  isPopular: false,
  status: "DRAFT",
  sortOrder: "0",
};

export default function DrinkMenuPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Drink[]; categories: Category[] }>("/api/drink?limit=100");
      setDrinks(res.data || []);
      setCategories(res.categories || []);
    } catch (error) {
      console.error("Load drinks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/drink/${editingId}`, form);
      else await api.post("/api/drink", form);
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (error) {
      console.error("Save drink error:", error);
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
          <p className="text-foreground-secondary mt-1">Manage drink items</p>
        </div>
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
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : drinks.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No drinks found</p>
        </div>
      ) : (
        <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Price</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drinks.map((drink) => (
                <tr key={drink.id} className="hover:bg-background-tertiary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{drink.name}</span>
                      {drink.isPopular && (
                        <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">{drink.category.name}</td>
                  <td className="px-4 py-3 text-foreground">¥{drink.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${drink.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                    >
                      {drink.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(drink)}
                        className="text-gold-400 hover:text-gold-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(drink.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit Drink" : "Add Drink"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="text-foreground-secondary hover:text-foreground"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Price *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                folder="drink-menu"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">Popular</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
