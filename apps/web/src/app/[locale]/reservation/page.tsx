"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ReservationPage() {
  const t = useTranslations("reservation");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    course: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit reservation");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
        course: "",
        notes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Reservation Submitted!</h2>
          <p className="text-foreground-secondary mb-6">
            Thank you for your reservation. We will confirm your booking via email.
          </p>
          <button onClick={() => setSuccess(false)} className="text-gold-400 hover:text-gold-300">
            Make another reservation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("name")} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("email")} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              {t("date")} *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              {t("time")} *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("guests")} *
          </label>
          <select
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("notes")}
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
            placeholder="Any special requests or dietary requirements..."
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-600 text-background font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
