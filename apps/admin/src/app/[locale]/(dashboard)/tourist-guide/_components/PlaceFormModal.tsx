import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { ImageUpload, MultiImageUpload } from "@/shared/components/image-upload";
import { toSlug } from "@resto-hub/utils";
import { Place, PlaceForm, emptyPlace, Category } from "./types";

interface PlaceFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: Place | null;
  categories: Category[];
  onClose: () => void;
  onDataChange: () => void;
}

export function PlaceFormModal({
  isOpen,
  editingId,
  initialData,
  categories,
  onClose,
  onDataChange,
}: PlaceFormModalProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");
  const [form, setForm] = useState<PlaceForm>(emptyPlace);

  useEffect(() => {
    if (editingId && initialData) {
      setForm({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        shortDescription: "",
        imageUrl: initialData.imageUrl || "",
        images: initialData.images || [],
        categoryId: initialData.category?.id || "",
        address: "",
        latitude: "",
        longitude: "",
        isPublished: initialData.isPublished,
      });
    } else {
      setForm(emptyPlace);
    }
  }, [editingId, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      categoryId: form.categoryId || null,
    };
    try {
      if (editingId) {
        await api.put(`/api/tourist/${editingId}`, payload);
      } else {
        await api.post("/api/tourist", payload);
      }
      onDataChange();
      onClose();
    } catch (error) {
      console.error("Save place error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editPlace") : t("addPlace")}
          </h3>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("nameLabel")} *
            </label>
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
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("shortDescLabel")}
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            folder="tourist-guide"
          />
          <MultiImageUpload
            value={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
            label={t("additionalImages")}
            folder="tourist-guide"
          />
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("categoryLabel")}
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            >
              <option value="">{t("noCategoryOption")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("addressLabel")}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">{t("publishedLabel")}</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors"
            >
              {editingId ? tc("save") : tc("add")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors"
            >
              {tc("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
