import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { ImageUpload } from "@/shared/components/image-upload";
import { Category, FormData, emptyForm, toSlug } from "./types";

interface FoodFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialForm: FormData;
  categories: Category[];
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function FoodFormModal({
  isOpen,
  editingId,
  initialForm,
  categories,
  onClose,
  onSubmitSuccess,
}: FoodFormModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/menu/${editingId}`, form);
      } else {
        await api.post("/api/menu", form);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Save food error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? "Edit Food" : "Add Food"}
          </h3>
          <button onClick={onClose} className="text-foreground-secondary hover:text-foreground">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({
                  ...form,
                  name,
                  slug: editingId ? form.slug : toSlug(name),
                });
              }}
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
              <label className="block text-sm text-foreground-secondary mb-1">Original Price</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            folder="food-menu"
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
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRecommended}
                onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Recommended</span>
            </label>
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
              onClick={onClose}
              className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
