import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showApiErrorToast, toastMessages } from "@/lib/toast";
import { ImageUpload, uploadImage } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { Category, FormData, toSlug } from "./types";
import { formatPriceWithTax } from "@resto-hub/utils";
import { useTaxRate } from "@/shared/hooks/use-tax-rate";

interface DrinkFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialForm: FormData;
  categories: Category[];
  onClose: () => void;
  onSubmitSuccess: (createdId?: string) => void;
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
  const taxRate = useTaxRate();
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
        finalImageUrl = await uploadImage(imageFile, "drink-menu");
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        await api.put(`/api/drink/${editingId}`, payload);
        onSubmitSuccess();
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/drink", payload);
        onSubmitSuccess(created.data.id);
      }
    } catch (error) {
      console.error("Save drink error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editDrink") : t("addDrink")}
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
            {t("priceLabel")} <span className="text-red-400">*</span>
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
              {t("pricePreview")}: {formatPriceWithTax(parseFloat(form.price), taxRate)}
            </p>
          )}
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
      </div>
      <ImageUpload
        value={form.imageUrl}
        onChange={(url, file) => {
          setForm({ ...form, imageUrl: url });
          setImageFile(file || null);
        }}
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
          <label className="block text-sm text-foreground-secondary mb-1">{t("volumeLabel")}</label>
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
