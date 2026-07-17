"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit message");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
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
          <h2 className="text-2xl font-bold text-green-400 mb-4">Message Sent!</h2>
          <p className="text-foreground-secondary mb-6">
            Thank you for your message. We will get back to you soon.
          </p>
          <button onClick={() => setSuccess(false)} className="text-gold-400 hover:text-gold-300">
            Send another message
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
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("subject")} *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("message")} *
          </label>
          <textarea
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
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
          {loading ? "Sending..." : t("submit" as never) || "Send Message"}
        </button>
      </form>
    </main>
  );
}
