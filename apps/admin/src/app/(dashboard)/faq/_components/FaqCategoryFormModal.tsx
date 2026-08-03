import { useTranslations } from "next-intl";
import { FormError } from "@/shared/components/form-error";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { CatForm } from "./types";

interface FaqCategoryFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: CatForm;
  error: string;
  isSaving?: boolean;
  setForm: (form: CatForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FaqCategoryFormModal({
  isOpen,
  editingId,
  form,
  error,
  isSaving,
  setForm,
  onClose,
  onSubmit,
}: FaqCategoryFormModalProps) {
  const t = useTranslations("faq");
  const tc = useTranslations("common");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full">
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("nameLabel")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={isSaving}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("slugLabel")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                disabled={isSaving}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50"
              />
            </div>
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
          <FormError message={error} />
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
