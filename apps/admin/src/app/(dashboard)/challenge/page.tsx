"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Rule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}
interface Winner {
  id: string;
  participantName: string;
  imageUrl: string | null;
  challengeName: string | null;
  discountAwarded: string | null;
  completedAt: string;
  isPublished: boolean;
}

type RuleForm = { title: string; description: string; sortOrder: number; isActive: boolean };
type WinnerForm = {
  participantName: string;
  imageUrl: string;
  challengeName: string;
  discountAwarded: string;
  completedAt: string;
  isPublished: boolean;
};

const emptyRule: RuleForm = { title: "", description: "", sortOrder: 0, isActive: true };
const emptyWinner: WinnerForm = {
  participantName: "",
  imageUrl: "",
  challengeName: "",
  discountAwarded: "",
  completedAt: new Date().toISOString().split("T")[0],
  isPublished: false,
};

export default function ChallengePage() {
  const [tab, setTab] = useState<"rules" | "winners">("rules");
  const [rules, setRules] = useState<Rule[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRule);
  const [winnerForm, setWinnerForm] = useState<WinnerForm>(emptyWinner);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: { rules: Rule[]; winners: Winner[] } }>("/api/challenge");
      setRules(res.data.rules || []);
      setWinners(res.data.winners || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/challenge/rules/${editingId}`, ruleForm);
      else await api.post("/api/challenge/rules", ruleForm);
      setShowModal(false);
      setEditingId(null);
      setRuleForm(emptyRule);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/challenge/winners/${editingId}`, winnerForm);
      else await api.post("/api/challenge/winners", winnerForm);
      setShowModal(false);
      setEditingId(null);
      setWinnerForm(emptyWinner);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEditRule = (item: Rule) => {
    setEditingId(item.id);
    setRuleForm({
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setTab("rules");
    setShowModal(true);
  };

  const handleEditWinner = (item: Winner) => {
    setEditingId(item.id);
    setWinnerForm({
      participantName: item.participantName,
      imageUrl: item.imageUrl || "",
      challengeName: item.challengeName || "",
      discountAwarded: item.discountAwarded || "",
      completedAt: item.completedAt.split("T")[0],
      isPublished: item.isPublished,
    });
    setTab("winners");
    setShowModal(true);
  };

  const handleDelete = async (type: "rules" | "winners", id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/api/challenge/${type}/${id}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Katanuki Challenge</h2>
          <p className="text-foreground-secondary mt-1">Manage rules and winners</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setRuleForm(emptyRule);
            setWinnerForm(emptyWinner);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add {tab === "rules" ? "Rule" : "Winner"}
        </button>
      </header>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab("rules")}
          className={`pb-3 px-1 font-medium transition-colors ${tab === "rules" ? "text-gold-500 border-b-2 border-gold-500" : "text-foreground-secondary hover:text-foreground"}`}
        >
          Rules ({rules.length})
        </button>
        <button
          onClick={() => setTab("winners")}
          className={`pb-3 px-1 font-medium transition-colors ${tab === "winners" ? "text-gold-500 border-b-2 border-gold-500" : "text-foreground-secondary hover:text-foreground"}`}
        >
          Winners ({winners.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "rules" ? (
        rules.length === 0 ? (
          <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
            <p className="text-foreground-secondary">No rules yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="bg-background-secondary border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-foreground-secondary text-sm w-8">#{idx + 1}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{rule.title}</h3>
                    <p className="text-sm text-foreground-secondary mt-0.5">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${rule.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {rule.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="text-gold-400 hover:text-gold-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete("rules", rule.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : winners.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No winners yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {winners.map((w) => (
            <div
              key={w.id}
              className="bg-background-secondary border border-border rounded-lg p-4 flex gap-4"
            >
              <div className="w-20 h-20 bg-background-tertiary rounded-lg flex-shrink-0 overflow-hidden">
                {w.imageUrl && (
                  <img
                    src={w.imageUrl}
                    alt={w.participantName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{w.participantName}</h3>
                {w.challengeName && (
                  <p className="text-sm text-foreground-secondary">{w.challengeName}</p>
                )}
                {w.discountAwarded && (
                  <p className="text-xs text-gold-400 mt-1">Discount: {w.discountAwarded}</p>
                )}
                <p className="text-xs text-foreground-secondary mt-1">
                  {new Date(w.completedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleEditWinner(w)}
                    className="text-gold-400 hover:text-gold-300 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete("winners", w.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Delete
                  </button>
                </div>
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
                {editingId ? "Edit" : "Add"} {tab === "rules" ? "Rule" : "Winner"}
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
            {tab === "rules" ? (
              <form onSubmit={handleRuleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Title *</label>
                  <input
                    type="text"
                    value={ruleForm.title}
                    onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Description *
                  </label>
                  <textarea
                    value={ruleForm.description}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={ruleForm.sortOrder}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleForm.isActive}
                    onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Active</span>
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
            ) : (
              <form onSubmit={handleWinnerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Participant Name *
                  </label>
                  <input
                    type="text"
                    value={winnerForm.participantName}
                    onChange={(e) =>
                      setWinnerForm({ ...winnerForm, participantName: e.target.value })
                    }
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Image URL</label>
                  <input
                    type="text"
                    value={winnerForm.imageUrl}
                    onChange={(e) => setWinnerForm({ ...winnerForm, imageUrl: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Challenge Name
                    </label>
                    <input
                      type="text"
                      value={winnerForm.challengeName}
                      onChange={(e) =>
                        setWinnerForm({ ...winnerForm, challengeName: e.target.value })
                      }
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Discount Awarded
                    </label>
                    <input
                      type="text"
                      value={winnerForm.discountAwarded}
                      onChange={(e) =>
                        setWinnerForm({ ...winnerForm, discountAwarded: e.target.value })
                      }
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Completed At
                  </label>
                  <input
                    type="date"
                    value={winnerForm.completedAt}
                    onChange={(e) => setWinnerForm({ ...winnerForm, completedAt: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={winnerForm.isPublished}
                    onChange={(e) =>
                      setWinnerForm({ ...winnerForm, isPublished: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Published</span>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
