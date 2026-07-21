"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: Record<string, string> | null;
  holidays: string[] | null;
  socialLinks: Record<string, string> | null;
  isActive: boolean;
}

export default function RestaurantInfoPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Restaurant | null }>("/api/info");
      if (res.data) {
        setRestaurant(res.data);
        setForm({
          name: res.data.name,
          slug: res.data.slug,
          description: res.data.description || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          latitude: res.data.latitude?.toString() || "",
          longitude: res.data.longitude?.toString() || "",
          isActive: res.data.isActive,
        });
      }
    } catch (error) {
      console.error("Load info error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/info", form);
      loadData();
    } catch (error) {
      console.error("Save info error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-background-secondary rounded-lg" />
      </div>
    );

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Restaurant Information</h2>
        <p className="text-foreground-secondary mt-1">Manage restaurant details</p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="bg-background-secondary border border-border rounded-lg p-6 space-y-6 max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Latitude</label>
            <input
              type="text"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">Longitude</label>
            <input
              type="text"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm text-foreground">Active</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-background px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}
