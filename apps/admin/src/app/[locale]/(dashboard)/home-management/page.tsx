"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { uploadImage } from "@/shared/components/image-upload";
import { useTranslations } from "next-intl";
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"banners" | "events" | "assets">("banners");

  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [logoSubtitle, setLogoSubtitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, eventsRes, infoRes] = await Promise.all([
        api.get<{ data: Banner[] }>("/api/banners"),
        api.get<{ data: Event[] }>("/api/events"),
        api.get<{ data: any }>("/api/info"),
      ]);
      setBanners(bannersRes.data || []);
      setEvents(eventsRes.data || []);
      setRestaurantInfo(infoRes.data || null);
      setLogoUrl(infoRes.data?.logoUrl || "");
      setFaviconUrl(infoRes.data?.faviconUrl || "");
      setLogoSubtitle(infoRes.data?.logoSubtitle || "鉄板・もんじゃ・居酒屋");
      setRestaurantName(infoRes.data?.name || "三代目土信田商店");
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
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

      setToast({ type: "success", message: t("saveSuccess") });
      setTimeout(() => setToast(null), 3000);

      const infoRes = await api.get<{ data: any }>("/api/info");
      setRestaurantInfo(infoRes.data);
      setLogoUrl(infoRes.data?.logoUrl || "");
      setFaviconUrl(infoRes.data?.faviconUrl || "");
      setLogoSubtitle(infoRes.data?.logoSubtitle || "鉄板・もんじゃ・居酒屋");
      setRestaurantName(infoRes.data?.name || "三代目土信田商店");
      setLogoFile(null);
      setFaviconFile(null);
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err.message || t("saveFailed") });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm(t("deleteBannerConfirm"))) return;
    try {
      await api.delete(`/api/banners/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete banner error:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(t("deleteEventConfirm"))) return;
    try {
      await api.delete(`/api/events/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete event error:", error);
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
        <BannerTab banners={banners} onDelete={deleteBanner} onRefresh={loadData} />
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
    </>
  );
}
