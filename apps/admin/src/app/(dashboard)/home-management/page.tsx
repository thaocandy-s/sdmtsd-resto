"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { uploadImage } from "@/shared/components/image-upload";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { BannerTab } from "./_components/BannerTab";
import { EventTab } from "./_components/EventTab";
import { BrandAssetsTab } from "./_components/BrandAssetsTab";
import { useReorder } from "@/shared/hooks/use-reorder";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";

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
interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function HomeManagementPage() {
  const t = useTranslations("homeManagement");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"banners" | "events" | "assets">("banners");
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [logoSubtitle, setLogoSubtitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const bannersQuery = useQuery({
    queryKey: ["banners"],
    queryFn: () => api.get<{ data: Banner[] }>("/api/banners"),
  });

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => api.get<{ data: Event[] }>("/api/events"),
  });

  const infoQuery = useQuery({
    queryKey: ["restaurant-info"],
    queryFn: () => api.get<{ data: any }>("/api/info"),
  });

  const banners = bannersQuery.data?.data ?? [];
  const events = eventsQuery.data?.data ?? [];
  const restaurantInfo = infoQuery.data?.data ?? null;
  const loading = bannersQuery.isPending || eventsQuery.isPending || infoQuery.isPending;

  const bannerHighlight = useHighlightNew();
  const { reorder: reorderBanners } = useReorder<Banner>({
    module: "banner",
    queryKey: ["banners"],
    selectItems: (data) => (data as { data: Banner[] }).data,
    applyItems: (data, next) => ({ ...(data as object), data: next }),
    getId: (item) => item.id,
  });

  // Seed the brand asset form whenever fresh info arrives
  useEffect(() => {
    if (!restaurantInfo) return;
    setLogoUrl(restaurantInfo.logoUrl || "");
    setFaviconUrl(restaurantInfo.faviconUrl || "");
    setLogoSubtitle(restaurantInfo.logoSubtitle || "鉄板・もんじゃ・居酒屋");
    setRestaurantName(restaurantInfo.name || "三代目土信田商店");
  }, [restaurantInfo]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["banners"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["restaurant-info"] });
  };

  const handleSaveAssets = async () => {
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;
      let finalFaviconUrl = faviconUrl;

      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, "brand");
      }
      if (faviconFile) {
        finalFaviconUrl = await uploadImage(faviconFile, "brand");
      }

      await api.put("/api/info", {
        ...restaurantInfo,
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
        logoSubtitle: logoSubtitle,
        name: restaurantName,
      });

      showSuccessToast(t("saveSuccess"));

      setLogoFile(null);
      setFaviconFile(null);
      queryClient.invalidateQueries({ queryKey: ["restaurant-info"] });
    } catch (err: any) {
      console.error(err);
      showApiErrorToast(err, t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirmType, setDeleteConfirmType] = useState<"banner" | "event" | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const deleteBanner = (id: string) => {
    setDeleteConfirmType("banner");
    setDeleteConfirmId(id);
  };

  const deleteEvent = (id: string) => {
    setDeleteConfirmType("event");
    setDeleteConfirmId(id);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmType || !deleteConfirmId) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      if (deleteConfirmType === "banner") {
        await api.delete(`/api/banners/${deleteConfirmId}`);
        queryClient.invalidateQueries({ queryKey: ["banners"] });
      } else {
        await api.delete(`/api/events/${deleteConfirmId}`);
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
      setDeleteConfirmType(null);
      setDeleteConfirmId(null);
      showSuccessToast(toastMessages.deleted);
    } catch (error) {
      console.error(`Delete ${deleteConfirmType} error:`, error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="mb-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">{t("title")}</h2>
          {activeTab === "banners" && (
            <button
              onClick={() => setBannerModalOpen(true)}
              className="inline-flex h-10 w-auto shrink-0 items-center justify-center rounded-lg bg-gold-500 px-4 py-2 font-semibold text-background transition-colors hover:bg-gold-600"
            >
              + {tCommon("add")}
            </button>
          )}
        </div>
        <p className="text-foreground-secondary mt-2 md:mt-1">{t("subtitle")}</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "banners"
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t("bannersTab", { count: banners.length })}
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "events"
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t("eventsTab", { count: events.length })}
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "assets"
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t("brandAssetsTab")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : activeTab === "banners" ? (
        <BannerTab
          banners={banners}
          onDelete={deleteBanner}
          onRefresh={refreshData}
          onReorder={reorderBanners}
          onCreated={bannerHighlight.flash}
          getHighlightProps={bannerHighlight.getHighlightProps}
          isModalOpen={bannerModalOpen}
          onModalOpenChange={setBannerModalOpen}
        />
      ) : activeTab === "assets" ? (
        <BrandAssetsTab
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          setLogoFile={setLogoFile}
          faviconUrl={faviconUrl}
          setFaviconUrl={setFaviconUrl}
          setFaviconFile={setFaviconFile}
          logoSubtitle={logoSubtitle}
          setLogoSubtitle={setLogoSubtitle}
          restaurantName={restaurantName}
          setRestaurantName={setRestaurantName}
          handleSaveAssets={handleSaveAssets}
          saving={saving}
        />
      ) : (
        <EventTab events={events} onDelete={deleteEvent} />
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete")}
        message={
          deleteConfirmType === "banner" ? t("deleteBannerConfirm") : t("deleteEventConfirm")
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        error={deleteError}
        onCancel={() => {
          setDeleteConfirmType(null);
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />
    </>
  );
}
