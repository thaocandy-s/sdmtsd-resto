import { useTranslations } from "next-intl";
import { FormModal } from "@/shared/components/form-modal";
import { CheckboxField, SelectField, TextArea, TextInput } from "@/shared/components/form-fields";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { FaqCategory, FaqForm } from "./types";

interface FaqItemFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: FaqForm;
  categories: FaqCategory[];
  error: string;
  setForm: (form: FaqForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FaqItemFormModal({
  isOpen,
  editingId,
  form,
  categories,
  error,
  setForm,
  onClose,
  onSubmit,
}: FaqItemFormModalProps) {
  const t = useTranslations("faq");
  const tc = useTranslations("common");

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editFaq") : t("addFaq")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      submitLabel={editingId ? tc("save") : tc("add")}
    >
      <TextInput
        label={t("questionLabel")}
        value={form.question}
        onChange={(question) => setForm({ ...form, question })}
        required
      />
      <TextArea
        label={t("answerLabel")}
        value={form.answer}
        onChange={(answer) => setForm({ ...form, answer })}
        required
        rows={4}
      />
      <SelectField
        label={t("categoryLabel")}
        value={form.categoryId}
        onChange={(categoryId) => setForm({ ...form, categoryId })}
        required
      >
        <option value="">{t("selectCategory")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectField>
      <CheckboxField
        label={t("publishedLabel")}
        checked={form.isPublished}
        onChange={(isPublished) => setForm({ ...form, isPublished })}
      />
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
