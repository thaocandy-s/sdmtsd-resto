"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  group: string;
}
type FormData = { key: string; value: string; group: string };
const emptyForm: FormData = { key: "", value: "", group: "general" };

const GROUPS = ["general", "restaurant", "social", "email", "analytics", "maintenance"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [groupFilter, setGroupFilter] = useState("");

  useEffect(() => {
    loadData();
  }, [groupFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = groupFilter ? `?group=${groupFilter}` : "";
      const res = await api.get<{ data: Setting[] }>(`/api/settings${params}`);
      setSettings(res.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(form.value);
    } catch {
      parsedValue = form.value;
    }

    try {
      await api.post("/api/settings", { key: form.key, value: parsedValue, group: form.group });
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (item: Setting) => {
    setEditingId(item.id);
    setForm({
      key: item.key,
      value: typeof item.value === "string" ? item.value : JSON.stringify(item.value, null, 2),
      group: item.group,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this setting?")) return;
    try {
      await api.delete(`/api/settings/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-foreground-secondary mt-1">Manage application settings</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Setting
        </button>
      </header>

      <div className="flex gap-3 mb-6">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:border-gold-500"
        >
          <option value="">All Groups</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No settings configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((s) => (
            <div
              key={s.id}
              className="bg-background-secondary border border-border rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-gold-400">{s.key}</code>
                  <span className="text-xs bg-background-tertiary text-foreground-secondary px-2 py-0.5 rounded">
                    {s.group}
                  </span>
                </div>
                <pre className="text-xs text-foreground-secondary mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {typeof s.value === "string" ? s.value : JSON.stringify(s.value)}
                </pre>
              </div>
              <div className="flex gap-3 ml-4">
                <button
                  onClick={() => handleEdit(s)}
                  className="text-gold-400 hover:text-gold-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit" : "Add"} Setting
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
                <label className="block text-sm text-foreground-secondary mb-1">Key *</label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  required
                  disabled={!!editingId}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">Group</label>
                <select
                  value={form.group}
                  onChange={(e) => setForm({ ...form, group: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground-secondary mb-1">
                  Value (JSON or plain text)
                </label>
                <textarea
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  rows={4}
                  placeholder='"value" or {"key": "value"}'
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 font-mono text-sm"
                />
              </div>
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
    </>
  );
}
