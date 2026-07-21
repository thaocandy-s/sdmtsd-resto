"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { ImageUpload, MultiImageUpload } from "@/shared/components/image-upload";

interface Place {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  category: { id: string; name: string } | null;
  isPublished: boolean;
}
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

type PlaceForm = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  categoryId: string;
  address: string;
  latitude: string;
  longitude: string;
  isPublished: boolean;
};
type CatForm = { name: string; slug: string; description: string; sortOrder: number };

const emptyPlace: PlaceForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  imageUrl: "",
  images: [],
  categoryId: "",
  address: "",
  latitude: "",
  longitude: "",
  isPublished: false,
};
const emptyCat: CatForm = { name: "", slug: "", description: "", sortOrder: 0 };

export default function TouristGuidePage() {
  const [tab, setTab] = useState<"places" | "categories">("places");
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [placeForm, setPlaceForm] = useState<PlaceForm>(emptyPlace);
  const [catForm, setCatForm] = useState<CatForm>(emptyCat);

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

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...placeForm,
      images: placeForm.images,
      latitude: placeForm.latitude ? parseFloat(placeForm.latitude) : null,
      longitude: placeForm.longitude ? parseFloat(placeForm.longitude) : null,
      categoryId: placeForm.categoryId || null,
    };
    try {
      if (editingId) await api.put(`/api/tourist/${editingId}`, payload);
      else await api.post("/api/tourist", payload);
      setShowModal(false);
      setEditingId(null);
      setPlaceForm(emptyPlace);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/tourist/categories/${editingId}`, catForm);
      else await api.post("/api/tourist/categories", catForm);
      setShowModal(false);
      setEditingId(null);
      setCatForm(emptyCat);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEditPlace = (item: Place) => {
    setEditingId(item.id);
    setPlaceForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      shortDescription: "",
      imageUrl: item.imageUrl || "",
      images: item.images || [],
      categoryId: item.category?.id || "",
      address: "",
      latitude: "",
      longitude: "",
      isPublished: item.isPublished,
    });
    setTab("places");
    setShowModal(true);
  };

  const handleEditCat = (item: Category) => {
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

  const handleDelete = async (type: "places" | "categories", id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      if (type === "places") await api.delete(`/api/tourist/${id}`);
      else await api.delete(`/api/tourist/categories/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tourist Guide</h2>
          <p className="text-foreground-secondary mt-1">Manage places and categories</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setPlaceForm(emptyPlace);
            setCatForm(emptyCat);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add {tab === "places" ? "Place" : "Category"}
        </button>
      </header>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab("places")}
          className={`pb-3 px-1 font-medium transition-colors ${tab === "places" ? "text-gold-500 border-b-2 border-gold-500" : "text-foreground-secondary hover:text-foreground"}`}
        >
          Places ({places.length})
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
      ) : tab === "places" ? (
        places.length === 0 ? (
          <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
            <p className="text-foreground-secondary">No places yet</p>
          </div>
        ) : (
          <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {places.map((p) => (
                  <tr key={p.id} className="hover:bg-background-tertiary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background-tertiary rounded overflow-hidden flex-shrink-0">
                          {p.imageUrl && (
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-foreground-secondary">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${p.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEditPlace(p)}
                        className="text-gold-400 hover:text-gold-300 text-sm mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete("places", p.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit" : "Add"} {tab === "places" ? "Place" : "Category"}
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
            {tab === "places" ? (
              <form onSubmit={handlePlaceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Name *</label>
                    <input
                      type="text"
                      value={placeForm.name}
                      onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Slug *</label>
                    <input
                      type="text"
                      value={placeForm.slug}
                      onChange={(e) => setPlaceForm({ ...placeForm, slug: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={placeForm.shortDescription}
                    onChange={(e) =>
                      setPlaceForm({ ...placeForm, shortDescription: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={placeForm.description}
                    onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <ImageUpload
                  value={placeForm.imageUrl}
                  onChange={(url) => setPlaceForm({ ...placeForm, imageUrl: url })}
                  folder="tourist-guide"
                />
                <MultiImageUpload
                  value={placeForm.images}
                  onChange={(urls) => setPlaceForm({ ...placeForm, images: urls })}
                  label="Additional Images"
                  folder="tourist-guide"
                />
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Category</label>
                  <select
                    value={placeForm.categoryId}
                    onChange={(e) => setPlaceForm({ ...placeForm, categoryId: e.target.value })}
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
                  <label className="block text-sm text-foreground-secondary mb-1">Address</label>
                  <input
                    type="text"
                    value={placeForm.address}
                    onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Latitude</label>
                    <input
                      type="text"
                      value={placeForm.latitude}
                      onChange={(e) => setPlaceForm({ ...placeForm, latitude: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={placeForm.longitude}
                      onChange={(e) => setPlaceForm({ ...placeForm, longitude: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={placeForm.isPublished}
                    onChange={(e) => setPlaceForm({ ...placeForm, isPublished: e.target.checked })}
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
