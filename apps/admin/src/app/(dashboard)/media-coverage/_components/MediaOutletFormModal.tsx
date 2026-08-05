import { useTranslations } from "next-intl";
import { ImageUpload } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
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

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editOutlet") : t("addOutlet")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
    >
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
    </FormModal>
  );
}
