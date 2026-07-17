"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

const MODULES = [
  { value: "food", label: "Food Menu", actions: ["publish", "unpublish", "archive", "delete"] },
  { value: "drink", label: "Drink Menu", actions: ["publish", "unpublish", "archive", "delete"] },
  { value: "buffet", label: "Buffet Menu", actions: ["publish", "unpublish", "archive", "delete"] },
  { value: "beer-art", label: "Beer Art", actions: ["publish", "unpublish", "delete"] },
  { value: "tourist", label: "Tourist Places", actions: ["publish", "unpublish", "delete"] },
  { value: "faq", label: "FAQ", actions: ["publish", "unpublish", "delete"] },
];

export default function BulkActionsPage() {
  const [module, setModule] = useState("food");
  const [action, setAction] = useState("publish");
  const [ids, setIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedModule = MODULES.find((m) => m.value === module);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idList = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (idList.length === 0) {
      setResult("Please enter at least one ID");
      return;
    }

    if (!confirm(`Apply "${action}" to ${idList.length} item(s) in "${selectedModule?.label}"?`))
      return;

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<{ data: { affected: number } }>("/api/bulk", {
        module,
        action,
        ids: idList,
      });
      setResult(`Successfully affected ${res.data.affected} item(s)`);
      setIds("");
    } catch (error) {
      console.error("Bulk action error:", error);
      setResult("Error executing bulk action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Bulk Actions</h2>
        <p className="text-foreground-secondary mt-1">Apply actions to multiple items at once</p>
      </header>

      <div className="max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-background-secondary border border-border rounded-lg p-6 space-y-6"
        >
          <div>
            <label className="block text-sm text-foreground-secondary mb-2">Module</label>
            <select
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setAction("publish");
              }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            >
              {MODULES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-foreground-secondary mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            >
              {selectedModule?.actions.map((a) => (
                <option key={a} value={a}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-foreground-secondary mb-2">
              Item IDs (comma-separated)
            </label>
            <textarea
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              rows={4}
              placeholder="uuid-1, uuid-2, uuid-3"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 font-mono text-sm"
            />
            <p className="text-xs text-foreground-secondary mt-1">
              Enter UUIDs separated by commas
            </p>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg text-sm ${result.includes("Success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {result}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !ids.trim()}
            className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-background py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "Processing..." : "Execute"}
          </button>
        </form>

        <div className="mt-6 bg-background-secondary border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Quick Reference</h3>
          <div className="space-y-2 text-xs text-foreground-secondary">
            <p>
              <strong className="text-foreground">Publish:</strong> Sets status to PUBLISHED or
              isPublished to true
            </p>
            <p>
              <strong className="text-foreground">Unpublish:</strong> Sets status to DRAFT or
              isPublished to false
            </p>
            <p>
              <strong className="text-foreground">Archive:</strong> Sets status to ARCHIVED (menu
              items only)
            </p>
            <p>
              <strong className="text-foreground">Delete:</strong> Soft deletes by setting deletedAt
              timestamp
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
