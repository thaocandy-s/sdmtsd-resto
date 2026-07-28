"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { uploadImage } from "@/shared/components/image-upload";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { BannerTab } from "./_components/BannerTab";
import { EventTab } from "./_components/EventTab";
import { BrandAssetsTab } from "./_components/BrandAssetsTab";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"banners" | "events" | "assets">("banners");

  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [logoSubtitle, setLogoSubtitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss toast; clears any pending timer so it never fires after unmount
  const showToast = useCallback((next: { type: "success" | "error"; message: string }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(next);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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

      showToast({ type: "success", message: t("saveSuccess") });

      setLogoFile(null);
      setFaviconFile(null);
      queryClient.invalidateQueries({ queryKey: ["restaurant-info"] });
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", message: err.message || t("saveFailed") });
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirmType, setDeleteConfirmType] = useState<"banner" | "event" | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteBanner = (id: string) => {
    setDeleteConfirmType("banner");
    setDeleteConfirmId(id);
  };

  const deleteEvent = (id: string) => {
    setDeleteConfirmType("event");
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmType || !deleteConfirmId) return;
    try {
      if (deleteConfirmType === "banner") {
        await api.delete(`/api/banners/${deleteConfirmId}`);
        queryClient.invalidateQueries({ queryKey: ["banners"] });
      } else {
        await api.delete(`/api/events/${deleteConfirmId}`);
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    } catch (error) {
      console.error(`Delete ${deleteConfirmType} error:`, error);
    } finally {
      setDeleteConfirmType(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "banners"
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t("bannersTab", { count: banners.length })}
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "events"
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t("eventsTab", { count: events.length })}
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
        <BannerTab banners={banners} onDelete={deleteBanner} onRefresh={refreshData} />
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

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/50 text-rose-200"
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete")}
        message={
          deleteConfirmType === "banner" ? t("deleteBannerConfirm") : t("deleteEventConfirm")
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmType(null);
          setDeleteConfirmId(null);
        }}
      />
    </>
  );
}
