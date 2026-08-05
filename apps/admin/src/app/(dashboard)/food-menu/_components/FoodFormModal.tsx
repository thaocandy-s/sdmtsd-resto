import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showApiErrorToast, toastMessages } from "@/lib/toast";
import { ImageUpload, uploadImage } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { Category, FormData, emptyForm, toSlug } from "./types";

interface FoodFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialForm: FormData;
  categories: Category[];
  onClose: () => void;
  onSubmitSuccess: (createdId?: string) => void;
}

export function FoodFormModal({
  isOpen,
  editingId,
  initialForm,
  categories,
  onClose,
  onSubmitSuccess,
}: FoodFormModalProps) {
  const t = useTranslations("foodMenu");
  const tc = useTranslations("common");
  const [form, setForm] = useState<FormData>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setImageFile(null);
      setError("");
    }
  }, [initialForm, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "food-menu");
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        await api.put(`/api/menu/${editingId}`, payload);
        onSubmitSuccess();
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/menu", payload);
        onSubmitSuccess(created.data.id);
      }
    } catch (error) {
      console.error("Save food error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editFood") : t("addFood")}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
      contentClassName="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
    >
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("nameLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm({
              ...form,
              name,
              slug: toSlug(name),
            });
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
            {t("priceLabel")} <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">
            {t("originalPriceLabel")}
          </label>
          <input
            type="number"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("categoryLabel")} <span className="text-red-400">*</span>
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
      <ImageUpload
        value={form.imageUrl}
        onChange={(url, file) => {
          setForm({ ...form, imageUrl: url });
          setImageFile(file || null);
        }}
        folder="food-menu"
      />
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("caloriesLabel")}</label>
        <input
          type="number"
          value={form.calories}
          onChange={(e) => setForm({ ...form, calories: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("ingredientsLabel")}
        </label>
        <textarea
          value={form.ingredients}
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
          rows={2}
          placeholder={t("ingredientsPlaceholder")}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("statusLabel")}</label>
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
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm text-foreground">{t("popularLabel")}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isRecommended}
            onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm text-foreground">{t("recommendedLabel")}</span>
        </label>
      </div>
      <AdvancedSection title={tc("advancedOptions")}>
        <PositionField
          value={form.position}
          onChange={(v) => setForm({ ...form, position: v })}
          label={tc("positionLabel")}
          hint={tc("positionHint")}
        />
      </AdvancedSection>
    </FormModal>
  );
}
