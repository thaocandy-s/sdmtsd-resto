import { useTranslations } from "next-intl";
import { FormModal } from "@/shared/components/form-modal";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { RuleForm } from "./types";

interface RuleFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: RuleForm;
  setForm: (form: RuleForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
}

export function RuleFormModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
  error,
}: RuleFormModalProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editRule") : t("addRule")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      submitLabel={editingId ? tc("save") : tc("add")}
    >
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("ruleTitleLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("ruleDescriptionLabel")} <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          rows={3}
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
