import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { ImageUpload } from "@/shared/components/image-upload";
import { Category, FormData, toSlug } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";

interface DrinkFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialForm: FormData;
  categories: Category[];
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function DrinkFormModal({
  isOpen,
  editingId,
  initialForm,
  categories,
  onClose,
  onSubmitSuccess,
}: DrinkFormModalProps) {
  const t = useTranslations("drinkMenu");
  const tc = useTranslations("common");
  const [form, setForm] = useState<FormData>(initialForm);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
    }
  }, [initialForm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/drink/${editingId}`, form);
      } else {
        await api.post("/api/drink", form);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Save drink error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editDrink") : t("addDrink")}
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
                setForm({ ...form, name, slug: toSlug(name) });
              }}
              required
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("priceLabel")} *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
              {parseFloat(form.price) > 0 && (
                <p className="text-xs text-gold-400 mt-1">
                  Preview: {formatPriceWithTax(parseFloat(form.price))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("categoryLabel")} *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              >
                <option value="">{t("selectCategory")}</option>
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
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("alcoholPercentLabel")}
              </label>
              <input
                type="number"
                step="0.1"
                value={form.alcoholPercent}
                onChange={(e) => setForm({ ...form, alcoholPercent: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                placeholder="e.g. 5.5"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("volumeLabel")}
              </label>
              <input
                type="text"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                placeholder="e.g. 330ml, 750ml"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("statusLabel")}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              >
                <option value="DRAFT">{tc("draft")}</option>
                <option value="PUBLISHED">{tc("published")}</option>
                <option value="ARCHIVED">{tc("archived")}</option>
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
            <span className="text-sm text-foreground">{t("popularLabel")}</span>
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
