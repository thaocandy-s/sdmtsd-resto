import { useTranslations } from "next-intl";
import { ImageUpload } from "@/shared/components/image-upload";
import { FormError } from "@/shared/components/form-error";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { OutletFormData } from "./types";

interface MediaOutletFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: OutletFormData;
  setForm: React.Dispatch<React.SetStateAction<OutletFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  isSaving: boolean;
  error?: string;
}

export function MediaOutletFormModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
  logoFile,
  setLogoFile,
  isSaving,
  error,
}: MediaOutletFormModalProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editOutlet") : t("addOutlet")}
          </h3>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <FormError message={error} />}
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("outletNameLabel")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <ImageUpload
            value={form.logoUrl}
            onChange={(url, file) => {
              setForm({ ...form, logoUrl: url });
              setLogoFile(file || null);
            }}
            label={t("outletLogoLabel")}
            required
            folder="media-outlets"
          />
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("outletWebsiteLabel")}
            </label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              placeholder="https://"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">{t("activeLabel")}</span>
          </label>
          <AdvancedSection title={tc("advancedOptions")}>
            <PositionField
              value={form.position}
              onChange={(v) => setForm({ ...form, position: v })}
              label={tc("positionLabel")}
              hint={tc("positionHint")}
            />
          </AdvancedSection>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? editingId
                  ? tc("save") + "..."
                  : tc("add") + "..."
                : editingId
                  ? tc("save")
                  : tc("add")}
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
