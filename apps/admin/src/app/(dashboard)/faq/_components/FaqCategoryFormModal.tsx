import { useTranslations } from "next-intl";
import { FormModal } from "@/shared/components/form-modal";
import { TextInput } from "@/shared/components/form-fields";
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

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editCategory") : t("addCategory")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
      closeDisabled={isSaving}
    >
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label={t("nameLabel")}
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          required
          disabled={isSaving}
        />
        <TextInput
          label={t("slugLabel")}
          value={form.slug}
          onChange={(slug) => setForm({ ...form, slug })}
          required
          disabled={isSaving}
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
