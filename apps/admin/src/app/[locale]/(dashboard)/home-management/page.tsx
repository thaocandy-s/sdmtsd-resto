"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"banners" | "events">("banners");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, eventsRes] = await Promise.all([
        api.get<{ data: Banner[] }>("/api/banners"),
        api.get<{ data: Event[] }>("/api/events"),
      ]);
      setBanners(bannersRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await api.delete(`/api/banners/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete banner error:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
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
        <h2 className="text-2xl font-bold text-foreground">Home Management</h2>
        <p className="text-foreground-secondary mt-1">Manage hero banners and events</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "banners" ? "bg-gold-500 text-background" : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"}`}
        >
          Banners ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "events" ? "bg-gold-500 text-background" : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"}`}
        >
          Events ({events.length})
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
        banners.length === 0 ? (
          <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
            <p className="text-foreground-secondary">No banners configured. Using default hero.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded bg-background-tertiary overflow-hidden">
                    {b.imageUrl && (
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="text-sm text-foreground-secondary">{b.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${b.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : events.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{e.title}</p>
                <p className="text-sm text-foreground-secondary">
                  {new Date(e.startDate).toLocaleDateString()} -{" "}
                  {new Date(e.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${e.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                >
                  {e.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => deleteEvent(e.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
