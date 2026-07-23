"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";

interface SeoMeta {
  id: string;
  pagePath: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  jsonLd: string | null;
}
type FormData = {
  pagePath: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  jsonLd: string;
};
const emptyForm: FormData = {
  pagePath: "",
  title: "",
  description: "",
  keywords: "",
  ogImage: "",
  ogTitle: "",
  ogDescription: "",
  canonicalUrl: "",
  noIndex: false,
  jsonLd: "",
};

export default function SeoPage() {
  const [items, setItems] = useState<SeoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: SeoMeta[] }>("/api/seo");
      setItems(res.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      keywords: form.keywords ? form.keywords.split(",").map((k) => k.trim()) : [],
      jsonLd: form.jsonLd || null,
    };
    try {
      if (editingId) await api.put(`/api/seo/${editingId}`, payload);
      else await api.post("/api/seo", payload);
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (item: SeoMeta) => {
    setEditingId(item.id);
    setForm({
      pagePath: item.pagePath,
      title: item.title || "",
      description: item.description || "",
      keywords: item.keywords?.join(", ") || "",
      ogImage: item.ogImage || "",
      ogTitle: item.ogTitle || "",
      ogDescription: item.ogDescription || "",
      canonicalUrl: item.canonicalUrl || "",
      noIndex: item.noIndex,
      jsonLd: item.jsonLd || "",
    });
    setShowModal(true);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/seo/${deleteConfirmId}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">SEO Management</h2>
          <p className="text-foreground-secondary mt-1">Manage meta tags per page</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Page
        </button>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No SEO entries yet</p>
        </div>
      ) : (
        <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-background-tertiary">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Page Path
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                  NoIndex
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-background-tertiary/50">
                  <td className="px-4 py-3">
                    <code className="text-sm text-gold-400">{item.pagePath}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.title || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${item.noIndex ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                    >
                      {item.noIndex ? "NoIndex" : "Index"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gold-400 hover:text-gold-300 text-sm mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit" : "Add"} SEO
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="text-foreground-secondary hover:text-foreground text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Page Path *</label>
                <input
                  type="text"
                  value={form.pagePath}
                  onChange={(e) => setForm({ ...form, pagePath: e.target.value })}
                  required
                  disabled={!!editingId}
                  placeholder="/en/about"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">OG Title</label>
                  <input
                    type="text"
                    value={form.ogTitle}
                    onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">OG Image</label>
                  <input
                    type="text"
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">
                  OG Description
                </label>
                <textarea
                  value={form.ogDescription}
                  onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={form.canonicalUrl}
                  onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">JSON-LD</label>
                <textarea
                  value={form.jsonLd}
                  onChange={(e) => setForm({ ...form, jsonLd: e.target.value })}
                  rows={3}
                  placeholder='{"@context": "https://schema.org", ...}'
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 font-mono text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.noIndex}
                  onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">NoIndex (hide from search engines)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete SEO Meta"
        message="Are you sure you want to delete this SEO meta?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
