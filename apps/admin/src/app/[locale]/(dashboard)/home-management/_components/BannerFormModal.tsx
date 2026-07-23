import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { ImageUpload, uploadImage } from "@/shared/components/image-upload";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface BannerFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: Banner | null;
  onClose: () => void;
  onDataChange: () => void;
}

export function BannerFormModal({
  isOpen,
  editingId,
  initialData,
  onClose,
  onDataChange,
}: BannerFormModalProps) {
  const t = useTranslations("homeManagement");
  const tc = useTranslations("common");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImageFile(null);
      if (editingId && initialData) {
        setTitle(initialData.title);
        setSubtitle(initialData.subtitle || "");
        setImageUrl(initialData.imageUrl);
        setSortOrder(initialData.sortOrder);
        setIsActive(initialData.isActive);
      } else {
        setTitle("");
        setSubtitle("");
        setImageUrl("");
        setSortOrder(0);
        setIsActive(true);
      }
    }
  }, [editingId, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "banners");
      }

      if (!finalImageUrl) {
        alert("Image is required");
        setIsSaving(false);
        return;
      }

      const data = {
        title,
        subtitle: subtitle || null,
        imageUrl: finalImageUrl,
        sortOrder,
        isActive,
        ctaLabel: null,
        ctaUrl: null,
      };

      if (editingId) {
        await api.put(`/api/banners/${editingId}`, data);
      } else {
        await api.post("/api/banners", data);
      }

      onDataChange();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-secondary border border-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">
            {editingId ? t("editBanner") : t("addBanner")}
          </h3>
          <button onClick={onClose} className="text-foreground-secondary hover:text-foreground">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("bannerTitle")} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("bannerSubtitle")}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>

          <ImageUpload
            label={t("bannerImage")}
            value={imageUrl}
            onChange={(url, file) => {
              setImageUrl(url);
              setImageFile(file || null);
            }}
            folder="banners"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("bannerSortOrder")}
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-gold-500 focus:ring-gold-500 bg-background"
                />
                <span className="text-sm font-medium text-foreground">{t("bannerStatus")}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-background-tertiary transition-colors"
            >
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-gold-500 text-background font-semibold rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? tc("loading") : tc("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
