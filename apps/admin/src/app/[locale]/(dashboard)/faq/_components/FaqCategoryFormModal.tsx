import { useTranslations } from "next-intl";
import { CatForm } from "./types";

interface FaqCategoryFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: CatForm;
  setForm: (form: CatForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FaqCategoryFormModal({
  isOpen,
  editingId,
  form,
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
            className="text-foreground-secondary hover:text-foreground text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("nameLabel")} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("slugLabel")} *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("sortOrderLabel")}
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
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
