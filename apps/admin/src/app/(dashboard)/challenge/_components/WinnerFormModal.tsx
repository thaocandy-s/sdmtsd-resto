import { useTranslations } from "next-intl";
import { ImageUpload } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
import { WinnerForm } from "./types";

interface WinnerFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: WinnerForm;
  setForm: (form: WinnerForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  error?: string;
}

export function WinnerFormModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
  imageFile,
  setImageFile,
  error,
}: WinnerFormModalProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editWinner") : t("addWinner")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      submitLabel={editingId ? tc("save") : tc("add")}
      contentClassName="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
    >
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("winnerNameLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.participantName}
          onChange={(e) => setForm({ ...form, participantName: e.target.value })}
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <ImageUpload
        value={form.imageUrl}
        onChange={(url, file) => {
          setForm({ ...form, imageUrl: url });
          setImageFile(file || null);
        }}
        label={t("imageLabel")}
        folder="challenge"
      />
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
    </FormModal>
  );
}
