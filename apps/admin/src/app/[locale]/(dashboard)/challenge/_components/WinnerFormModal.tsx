import { useTranslations } from "next-intl";
import { WinnerForm } from "./types";

interface WinnerFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: WinnerForm;
  setForm: (form: WinnerForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function WinnerFormModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
}: WinnerFormModalProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editWinner") : t("addWinner")}
          </h3>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("winnerNameLabel")} *
            </label>
            <input
              type="text"
              value={form.participantName}
              onChange={(e) => setForm({ ...form, participantName: e.target.value })}
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("imageLabel")}
            </label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("winnerChallengeLabel")}
              </label>
              <input
                type="text"
                value={form.challengeName}
                onChange={(e) => setForm({ ...form, challengeName: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("winnerAwardLabel")}
              </label>
              <input
                type="text"
                value={form.discountAwarded}
                onChange={(e) => setForm({ ...form, discountAwarded: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("completedAtLabel")}
            </label>
            <input
              type="date"
              value={form.completedAt}
              onChange={(e) => setForm({ ...form, completedAt: e.target.value })}
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
