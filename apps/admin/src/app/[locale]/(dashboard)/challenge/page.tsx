"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ImageUpload, uploadImage } from "@/shared/components/image-upload";
import { Rule, Winner, RuleForm, WinnerForm, emptyRule, emptyWinner } from "./_components/types";
import { RuleList } from "./_components/RuleList";
import { WinnerList } from "./_components/WinnerList";
import { RuleFormModal } from "./_components/RuleFormModal";
import { WinnerFormModal } from "./_components/WinnerFormModal";

export default function ChallengePage() {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  const [tab, setTab] = useState<"rules" | "winners">("rules");
  const [rules, setRules] = useState<Rule[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [challengeImage, setChallengeImage] = useState<string>("/images/katanuki.png");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination states for winners
  const [winnersPage, setWinnersPage] = useState(1);
  const [totalWinnersPages, setTotalWinnersPages] = useState(1);
  const [totalWinners, setTotalWinners] = useState(0);

  // Modal State
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRule);
  const [winnerForm, setWinnerForm] = useState<WinnerForm>(emptyWinner);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "rules" | "winners";
    id: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [winnersPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        data: {
          rules: Rule[];
          winners: Winner[];
          challengeImage?: string;
          meta?: {
            winnersPage: number;
            totalWinners: number;
            totalWinnersPages: number;
          };
        };
      }>(`/api/challenge?winnersPage=${winnersPage}&winnersLimit=10`);
      setRules(res.data.rules || []);
      setWinners(res.data.winners || []);
      if (res.data.challengeImage) {
        setChallengeImage(res.data.challengeImage);
      }
      if (res.data.meta) {
        setTotalWinnersPages(res.data.meta.totalWinnersPages || 1);
        setTotalWinners(res.data.meta.totalWinners || 0);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (url: string, file?: File | null) => {
    setIsSavingImage(true);
    try {
      let finalUrl = url;
      if (file) {
        finalUrl = await uploadImage(file, "challenge");
      }
      await api.post("/api/settings", {
        key: "katanuki_image",
        value: finalUrl,
        group: "challenge",
      });
      setChallengeImage(finalUrl);
    } catch (error) {
      console.error("Error saving challenge image:", error);
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/challenge/rules/${editingId}`, ruleForm);
      else await api.post("/api/challenge/rules", ruleForm);
      setShowRuleModal(false);
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
      setShowWinnerModal(false);
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
    setShowRuleModal(true);
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
    setShowWinnerModal(true);
  };

  const handleDeleteTrigger = (type: "rules" | "winners", id: string) => {
    setDeleteTarget({ type, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/challenge/${deleteTarget.type}/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            if (tab === "rules") {
              setRuleForm(emptyRule);
              setShowRuleModal(true);
            } else {
              setWinnerForm(emptyWinner);
              setShowWinnerModal(true);
            }
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + {tab === "rules" ? t("addRule") : t("addWinner")}
        </button>
      </header>

      {/* Illustration Upload Section */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/3 max-w-sm">
          <ImageUpload value={challengeImage} onChange={handleImageChange} folder="challenge" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-foreground mb-2">{t("illustrationTitle")}</h3>
          <p className="text-sm text-foreground-secondary mb-4">{t("illustrationSubtitle")}</p>
          {isSavingImage && (
            <p className="text-sm text-gold-500 animate-pulse font-medium">{tc("saving")}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab("rules")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "rules"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("rulesTab")} ({rules.length})
        </button>
        <button
          onClick={() => setTab("winners")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "winners"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("winnersTab")} ({winners.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "rules" ? (
        <RuleList
          rules={rules}
          onEdit={handleEditRule}
          onDelete={(id) => handleDeleteTrigger("rules", id)}
        />
      ) : (
        <>
          <WinnerList
            winners={winners}
            onEdit={handleEditWinner}
            onDelete={(id) => handleDeleteTrigger("winners", id)}
          />

          {!loading && totalWinnersPages > 1 && (
            <div className="mt-8 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-foreground-secondary">
                Showing page {winnersPage} / {totalWinnersPages} ({totalWinners} total)
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setWinnersPage(Math.max(winnersPage - 1, 1))}
                  disabled={winnersPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {tc("previous")}
                </button>
                <button
                  onClick={() => setWinnersPage(Math.min(winnersPage + 1, totalWinnersPages))}
                  disabled={winnersPage === totalWinnersPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {tc("next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <RuleFormModal
        isOpen={showRuleModal}
        editingId={editingId}
        form={ruleForm}
        setForm={setRuleForm}
        onClose={() => {
          setShowRuleModal(false);
          setEditingId(null);
        }}
        onSubmit={handleRuleSubmit}
      />

      <WinnerFormModal
        isOpen={showWinnerModal}
        editingId={editingId}
        form={winnerForm}
        setForm={setWinnerForm}
        onClose={() => {
          setShowWinnerModal(false);
          setEditingId(null);
        }}
        onSubmit={handleWinnerSubmit}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
