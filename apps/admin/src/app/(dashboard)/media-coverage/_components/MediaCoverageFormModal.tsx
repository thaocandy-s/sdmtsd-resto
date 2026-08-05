import { useTranslations } from "next-intl";
import { ImageUpload } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { ArticleFormData, CATEGORY_OPTIONS } from "./types";

interface MediaCoverageFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: ArticleFormData;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isSaving: boolean;
  error?: string;
}

function PreviewCard({ form }: { form: ArticleFormData }) {
  const t = useTranslations("mediaCoverage");

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-background">
      <p className="text-xs text-foreground-secondary px-3 py-2 border-b border-border">
        {t("previewLabel")}
      </p>
      <div className={form.isFeatured ? "md:grid md:grid-cols-2 gap-0" : ""}>
        <div
          className={`relative bg-background-tertiary ${form.isFeatured ? "min-h-[180px]" : "h-32"}`}
        >
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
              {t("noImage")}
            </div>
          )}
        </div>
        <div className="p-3">
          {form.mediaName && <p className="text-xs text-gold-400 mb-1">{form.mediaName}</p>}
          {form.publishedAt && (
            <p className="text-xs text-foreground-tertiary mb-1">{form.publishedAt}</p>
          )}
          {form.category && (
            <span className="inline-block text-xs px-2 py-0.5 bg-gold-500/10 text-gold-400 rounded mb-2">
              {t(`category.${form.category}`)}
            </span>
          )}
          <h4 className="font-semibold text-foreground text-sm line-clamp-2">
            {form.title || t("titleLabel")}
          </h4>
          {form.description && (
            <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">
              {form.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaCoverageFormModal({
  isOpen,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
  imageFile,
  setImageFile,
  isSaving,
  error,
}: MediaCoverageFormModalProps) {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editArticle") : t("addArticle")}
      onClose={onClose}
      onSubmit={onSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
      overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      contentClassName="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full my-8"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">
            {t("publishedDateLabel")} <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">
            {t("mediaNameLabel")} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.mediaName}
            onChange={(e) => setForm({ ...form, mediaName: e.target.value })}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("titleLabel")} <span className="text-red-400">*</span>
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
          {t("descriptionLabel")}
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <ImageUpload
        value={form.imageUrl}
        onChange={(url, file) => {
          setForm({ ...form, imageUrl: url });
          setImageFile(file || null);
        }}
        label={t("thumbnailLabel")}
        required
        folder="media-coverage"
      />
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("externalUrlLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={form.externalUrl}
          onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
          required
          placeholder="https://"
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("categoryLabel")} <span className="text-red-400">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value as ArticleFormData["category"],
            })
          }
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{t("selectCategory")}</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category.${cat}`)}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          className="rounded border-border"
        />
        <span className="text-sm text-foreground">{t("featuredLabel")}</span>
      </label>
      {form.isFeatured && (
        <p className="text-xs text-foreground-tertiary -mt-2">{t("featuredHint")}</p>
      )}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          className="rounded border-border"
        />
        <span className="text-sm text-foreground">{t("publishedLabel")}</span>
      </label>
      <AdvancedSection title={tc("advancedOptions")}>
        <PositionField
          value={form.position}
          onChange={(v) => setForm({ ...form, position: v })}
          label={tc("positionLabel")}
          hint={tc("positionHint")}
        />
      </AdvancedSection>
      <PreviewCard form={form} />
    </FormModal>
  );
}
