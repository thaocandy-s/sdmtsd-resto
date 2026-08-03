import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { toSlug } from "@resto-hub/utils";
import { FormError } from "@/shared/components/form-error";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editCategory") : t("addCategory")}
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-foreground-secondary hover:text-foreground text-2xl disabled:opacity-50"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormError message={error} />}
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
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && (
                <svg
                  className="animate-spin h-4 w-4 text-background"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {editingId ? tc("save") : tc("add")}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {tc("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
