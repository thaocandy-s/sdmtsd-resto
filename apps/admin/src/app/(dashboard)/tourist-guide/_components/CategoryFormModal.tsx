import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { toSlug } from "@resto-hub/utils";
import { FormModal } from "@/shared/components/form-modal";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { Category, CatForm, emptyCat } from "./types";

interface CategoryFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: Category | null;
  onClose: () => void;
  onDataChange: (createdId?: string) => void;
}

export function CategoryFormModal({
  isOpen,
  editingId,
  initialData,
  onClose,
  onDataChange,
}: CategoryFormModalProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");
  const [form, setForm] = useState<CatForm>(emptyCat);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setError("");
    if (editingId && initialData) {
      setForm({
        name: initialData.name,
        slug: initialData.slug,
        position: "",
      });
    } else {
      setForm(emptyCat);
    }
  }, [editingId, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/tourist/categories/${editingId}`, form);
        onDataChange();
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/tourist/categories", form);
        onDataChange(created.data.id);
      }
      showSuccessToast(editingId ? tc("saved") : tc("created"));
      onClose();
    } catch (error) {
      console.error("Save category error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editCategory") : t("addCategory")}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
      closeDisabled={isSaving}
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
          disabled={isSaving}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50"
        />
      </div>

      <AdvancedSection title={tc("advancedOptions")}>
        <PositionField
          value={form.position}
          onChange={(v) => setForm({ ...form, position: v })}
          label={tc("positionLabel")}
          hint={tc("positionHint")}
          disabled={isSaving}
        />
      </AdvancedSection>
    </FormModal>
  );
}
