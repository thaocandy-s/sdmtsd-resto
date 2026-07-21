import { useState } from "react";
import { api } from "@/lib/api-client";
import { Category, CategoryFormData, emptyCategoryForm, toSlug } from "./types";

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onDataChange: () => void;
}

export function CategoryManagerModal({
  isOpen,
  categories,
  onClose,
  onDataChange,
}: CategoryManagerModalProps) {
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>(emptyCategoryForm);

  if (!isOpen) return null;

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await api.put(`/api/drink/categories/${editingCatId}`, catForm);
      } else {
        await api.post("/api/drink/categories", catForm);
      }
      setEditingCatId(null);
      setIsAddingCat(false);
      setCatForm(emptyCategoryForm);
      onDataChange();
    } catch (error) {
      console.error("Save category error:", error);
    }
  };

  const handleCatEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      sortOrder: (cat.sortOrder || 0).toString(),
    });
    setIsAddingCat(true);
  };

  const handleCatDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/api/drink/categories/${id}`);
      onDataChange();
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  const handleClose = () => {
    setIsAddingCat(false);
    setEditingCatId(null);
    setCatForm(emptyCategoryForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">Drink Categories</h3>
            <p className="text-sm text-foreground-secondary mt-0.5">
              Manage categories and descriptions displayed on web
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-foreground-secondary hover:text-foreground text-xl"
          >
            &times;
          </button>
        </div>

        {/* Category Form */}
        {isAddingCat ? (
          <form
            onSubmit={handleCatSubmit}
            className="bg-background border border-border rounded-lg p-4 space-y-4"
          >
            <h4 className="font-semibold text-gold-400">
              {editingCatId ? "Edit Category" : "Add New Category"}
            </h4>
            <div>
              <label className="block text-xs text-foreground-secondary mb-1">Name *</label>
              <input
                type="text"
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm({ ...catForm, name, slug: toSlug(name) });
                }}
                required
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground-secondary mb-1">
                Description (Displays on web menu section)
              </label>
              <textarea
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                rows={2}
                placeholder="e.g. Fine selection of craft beers and seasonal Japanese brews."
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs text-foreground-secondary mb-1">Sort Order</label>
              <input
                type="number"
                value={catForm.sortOrder}
                onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {editingCatId ? "Save Changes" : "Create Category"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCat(false);
                  setEditingCatId(null);
                  setCatForm(emptyCategoryForm);
                }}
                className="bg-background-tertiary hover:bg-background border border-border text-foreground px-4 py-1.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => {
              setIsAddingCat(true);
              setEditingCatId(null);
              setCatForm(emptyCategoryForm);
            }}
            className="w-full py-2 border border-dashed border-gold-500/50 hover:border-gold-500 text-gold-400 rounded-lg text-sm font-medium transition-colors text-center"
          >
            + Add New Category
          </button>
        )}

        {/* Category Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background-tertiary border-b border-border">
              <tr className="text-left text-foreground-secondary">
                <th className="px-4 py-2.5">Name / Slug</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Drinks</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-background-tertiary/50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{cat.name}</div>
                    <div className="text-xs text-foreground-tertiary">{cat.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-foreground-secondary max-w-xs truncate">
                    {cat.description || (
                      <span className="text-foreground-tertiary italic">No description</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-foreground-secondary">
                    {cat._count?.drinks ?? 0} items
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCatEdit(cat)}
                        className="text-gold-400 hover:text-gold-300 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCatDelete(cat.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
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
      </div>
    </div>
  );
}
