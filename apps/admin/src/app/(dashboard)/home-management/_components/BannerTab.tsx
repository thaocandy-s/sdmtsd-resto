import { useState } from "react";
import { useTranslations } from "next-intl";
import { BannerFormModal } from "./BannerFormModal";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

interface BannerTabProps {
  banners: Banner[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onReorder: (orderedIds: string[]) => void;
  onCreated: (id: string) => void;
  getHighlightProps: (id: string) => { "data-highlight-id": string; className: string };
}

export function BannerTab({
  banners,
  onDelete,
  onRefresh,
  onReorder,
  onCreated,
  getHighlightProps,
}: BannerTabProps) {
  const t = useTranslations("homeManagement");
  const tCommon = useTranslations("common");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Banner | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setEditingData(null);
    setModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditingData(banner);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + {tCommon("add")}
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">{t("noBanners")}</p>
        </div>
      ) : (
        <SortableList
          items={banners}
          onReorder={onReorder}
          className="space-y-4"
          renderItem={(b, index, handle) => {
            const hp = getHighlightProps(b.id);
            return (
              <div
                {...hp}
                className={`bg-background-secondary border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${hp.className}`}
              >
                <div className="flex items-center gap-3">
                  {handle}
                  <OrderBadge order={index + 1} />
                  <div className="w-24 h-16 rounded bg-background-tertiary overflow-hidden flex-shrink-0">
                    {b.imageUrl && (
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="text-sm text-foreground-secondary">{b.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      b.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {b.isActive ? tCommon("active") : tCommon("inactive")}
                  </span>
                  <button
                    onClick={() => handleEdit(b)}
                    className="text-gold-400 hover:text-gold-300 text-sm"
                  >
                    {tCommon("edit")}
                  </button>
                  <button
                    onClick={() => onDelete(b.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    {tCommon("delete")}
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}

      <BannerFormModal
        isOpen={modalOpen}
        editingId={editingId}
        initialData={editingData}
        onClose={() => setModalOpen(false)}
        onDataChange={(createdId) => {
          onRefresh();
          if (createdId) onCreated(createdId);
        }}
      />
    </div>
  );
}
