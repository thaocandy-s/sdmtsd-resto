import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { ImageUpload, MultiImageUpload, uploadImage } from "@/shared/components/image-upload";
import { FormModal } from "@/shared/components/form-modal";
import { toSlug } from "@resto-hub/utils";
import { Place, PlaceForm, emptyPlace, Category } from "./types";

interface PlaceFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: Place | null;
  categories: Category[];
  onClose: () => void;
  onDataChange: () => void;
}

export function PlaceFormModal({
  isOpen,
  editingId,
  initialData,
  categories,
  onClose,
  onDataChange,
}: PlaceFormModalProps) {
  const t = useTranslations("touristGuide");
  const tc = useTranslations("common");
  const [form, setForm] = useState<PlaceForm>(emptyPlace);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setImageFile(null);
      setGalleryFiles([]);
      if (editingId && initialData) {
        const rawHours = initialData.openingHours || "";
        const parts = rawHours.split(/\s*[-~～—]\s*/);
        setForm({
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description || "",
          imageUrl: initialData.imageUrl || "",
          images: initialData.images || [],
          categoryId: initialData.category?.id || "",
          address: initialData.address || "",
          websiteUrl: initialData.websiteUrl || "",
          googleMapUrl: initialData.googleMapUrl || "",
          openingHoursStart: parts[0] || "",
          openingHoursEnd: parts[1] || "",
          latitude:
            initialData.latitude !== null && initialData.latitude !== undefined
              ? String(initialData.latitude)
              : "",
          longitude:
            initialData.longitude !== null && initialData.longitude !== undefined
              ? String(initialData.longitude)
              : "",
          isPublished: initialData.isPublished,
        });
      } else {
        setForm(emptyPlace);
      }
    }
  }, [editingId, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "tourist-guide");
      }

      let blobCounter = 0;
      const finalImages = [];
      for (const url of form.images) {
        if (url.startsWith("blob:")) {
          const fileToUpload = galleryFiles[blobCounter];
          if (fileToUpload) {
            const uploadedUrl = await uploadImage(fileToUpload, "tourist-guide");
            finalImages.push(uploadedUrl);
          }
          blobCounter++;
        } else {
          finalImages.push(url);
        }
      }

      const openingHours =
        form.openingHoursStart || form.openingHoursEnd
          ? `${form.openingHoursStart || ""}${form.openingHoursStart && form.openingHoursEnd ? " - " : ""}${form.openingHoursEnd || ""}`
          : "";

      const payload = {
        ...form,
        openingHours: openingHours || null,
        websiteUrl: form.websiteUrl || null,
        googleMapUrl: form.googleMapUrl || null,
        imageUrl: finalImageUrl,
        images: finalImages,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (editingId) {
        await api.put(`/api/tourist/${editingId}`, payload);
      } else {
        await api.post("/api/tourist", payload);
      }
      onDataChange();
      onClose();
      showSuccessToast(editingId ? tc("saved") : tc("created"));
    } catch (error) {
      console.error("Save place error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      title={editingId ? t("editPlace") : t("addPlace")}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      isSaving={isSaving}
      submitLabel={editingId ? tc("save") : tc("add")}
      contentClassName="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
    >
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("nameLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm({
              ...form,
              name,
              slug: toSlug(name),
            });
          }}
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
        folder="tourist-guide"
      />
      <MultiImageUpload
        value={form.images}
        files={galleryFiles}
        onChange={(urls, files) => {
          setForm({ ...form, images: urls });
          setGalleryFiles(files);
        }}
        label={t("additionalImages")}
        folder="tourist-guide"
      />
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("categoryLabel")} <span className="text-red-400">*</span>
        </label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{t("selectCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("addressLabel")}</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("openingHoursLabel")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={form.openingHoursStart}
            onChange={(e) => setForm({ ...form, openingHoursStart: e.target.value })}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
          <span className="text-foreground-secondary">〜</span>
          <input
            type="time"
            value={form.openingHoursEnd}
            onChange={(e) => setForm({ ...form, openingHoursEnd: e.target.value })}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("websiteUrlLabel")}
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          value={form.websiteUrl}
          onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">
          {t("googleMapUrlLabel")}
        </label>
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          value={form.googleMapUrl}
          onChange={(e) => setForm({ ...form, googleMapUrl: e.target.value })}
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
