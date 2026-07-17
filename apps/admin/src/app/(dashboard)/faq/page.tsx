"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  category: { id: string; name: string } | null;
}
interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

type FaqForm = {
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  categoryId: string;
};
type CatForm = { name: string; slug: string; description: string; sortOrder: number };

const emptyFaq: FaqForm = {
  question: "",
  answer: "",
  sortOrder: 0,
  isPublished: true,
  categoryId: "",
};
const emptyCat: CatForm = { name: "", slug: "", description: "", sortOrder: 0 };

export default function FaqPage() {
  const [tab, setTab] = useState<"items" | "categories">("items");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState<FaqForm>(emptyFaq);
  const [catForm, setCatForm] = useState<CatForm>(emptyCat);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, cRes] = await Promise.all([
        api.get<{ data: FaqItem[] }>("/api/faq"),
        api.get<{ data: FaqCategory[] }>("/api/faq/categories"),
      ]);
      setItems(fRes.data || []);
      setCategories(cRes.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...faqForm, categoryId: faqForm.categoryId || null };
    try {
      if (editingId) await api.put(`/api/faq/${editingId}`, payload);
      else await api.post("/api/faq", payload);
      setShowModal(false);
      setEditingId(null);
      setFaqForm(emptyFaq);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/faq/categories/${editingId}`, catForm);
      else await api.post("/api/faq/categories", catForm);
      setShowModal(false);
      setEditingId(null);
      setCatForm(emptyCat);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEditFaq = (item: FaqItem) => {
    setEditingId(item.id);
    setFaqForm({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      categoryId: item.category?.id || "",
    });
    setTab("items");
    setShowModal(true);
  };

  const handleEditCat = (item: FaqCategory) => {
    setEditingId(item.id);
    setCatForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      sortOrder: item.sortOrder,
    });
    setTab("categories");
    setShowModal(true);
  };

  const handleDelete = async (type: "items" | "categories", id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      if (type === "items") await api.delete(`/api/faq/${id}`);
      else await api.delete(`/api/faq/categories/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
          <p className="text-foreground-secondary mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFaqForm(emptyFaq);
            setCatForm(emptyCat);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add {tab === "items" ? "FAQ" : "Category"}
        </button>
      </header>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab("items")}
          className={`pb-3 px-1 font-medium transition-colors ${tab === "items" ? "text-gold-500 border-b-2 border-gold-500" : "text-foreground-secondary hover:text-foreground"}`}
        >
          Questions ({items.length})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`pb-3 px-1 font-medium transition-colors ${tab === "categories" ? "text-gold-500 border-b-2 border-gold-500" : "text-foreground-secondary hover:text-foreground"}`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "items" ? (
        items.length === 0 ? (
          <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
            <p className="text-foreground-secondary">No FAQ items yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-background-secondary border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.question}</h3>
                    <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                      {item.answer}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {item.category && (
                        <span className="text-xs bg-background-tertiary text-foreground-secondary px-2 py-0.5 rounded">
                          {item.category.name}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${item.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-foreground-secondary">
                        Order: {item.sortOrder}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleEditFaq(item)}
                      className="text-gold-400 hover:text-gold-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("items", item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : categories.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No categories yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-foreground">{c.name}</h3>
                <p className="text-sm text-foreground-secondary">
                  {c.slug} · Order: {c.sortOrder}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditCat(c)}
                  className="text-gold-400 hover:text-gold-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete("categories", c.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit" : "Add"} {tab === "items" ? "FAQ" : "Category"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="text-foreground-secondary hover:text-foreground text-2xl"
              >
                &times;
              </button>
            </div>
            {tab === "items" ? (
              <form onSubmit={handleFaqSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Question *</label>
                  <input
                    type="text"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Answer *</label>
                  <textarea
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Category</label>
                    <select
                      value={faqForm.categoryId}
                      onChange={(e) => setFaqForm({ ...faqForm, categoryId: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    >
                      <option value="">No category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={faqForm.sortOrder}
                      onChange={(e) =>
                        setFaqForm({ ...faqForm, sortOrder: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faqForm.isPublished}
                    onChange={(e) => setFaqForm({ ...faqForm, isPublished: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Published</span>
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
            ) : (
              <form onSubmit={handleCatSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Name *</label>
                    <input
                      type="text"
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Slug *</label>
                    <input
                      type="text"
                      value={catForm.slug}
                      onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    rows={2}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={catForm.sortOrder}
                    onChange={(e) =>
                      setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
