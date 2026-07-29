"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";
import { ImageUpload, uploadImage } from "@/shared/components/image-upload";
import { useReorder } from "@/shared/hooks/use-reorder";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import { Rule, Winner, RuleForm, WinnerForm, emptyRule, emptyWinner } from "./_components/types";
import { RuleList } from "./_components/RuleList";
import { WinnerList } from "./_components/WinnerList";
import { RuleFormModal } from "./_components/RuleFormModal";
import { WinnerFormModal } from "./_components/WinnerFormModal";

export default function ChallengePage() {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"rules" | "winners">("rules");
  const [savedChallengeImage, setSavedChallengeImage] = useState<string | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);

  // Pagination states for winners
  const [winnersPage, setWinnersPage] = useState(1);

  // Modal State
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRule);
  const [winnerForm, setWinnerForm] = useState<WinnerForm>(emptyWinner);
  const [winnerImageFile, setWinnerImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "rules" | "winners";
    id: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Reorder Mode dialog state (winners tab)
  const [showReorderModal, setShowReorderModal] = useState(false);

  const challengeQuery = useQuery({
    queryKey: ["challenge", { winnersPage }],
    queryFn: () =>
      api.get<{
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
      }>(`/api/challenge?winnersPage=${winnersPage}&winnersLimit=10`),
    placeholderData: keepPreviousData,
  });

  const rules = challengeQuery.data?.data.rules ?? [];
  const winners = challengeQuery.data?.data.winners ?? [];
  const totalWinnersPages = challengeQuery.data?.data.meta?.totalWinnersPages ?? 1;
  const totalWinners = challengeQuery.data?.data.meta?.totalWinners ?? 0;
  const challengeImage =
    savedChallengeImage ?? challengeQuery.data?.data.challengeImage ?? "/images/katanuki.png";
  const loading = challengeQuery.isPending;

  const ruleHighlight = useHighlightNew();
  const { reorder: reorderRules } = useReorder<Rule>({
    module: "katanuki-rule",
    queryKey: ["challenge", { winnersPage }],
    selectItems: (data) => (data as { data: { rules: Rule[] } }).data.rules,
    applyItems: (data, next) => {
      const d = data as { data: { rules: Rule[] } };
      return { ...d, data: { ...d.data, rules: next } };
    },
    getId: (item) => item.id,
  });

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
      setSavedChallengeImage(finalUrl);
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    } catch (error) {
      console.error("Error saving challenge image:", error);
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/api/challenge/rules/${editingId}`, ruleForm);
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/challenge/rules", ruleForm);
        ruleHighlight.flash(created.data.id);
      }
      toast.success(editingId ? tc("saved") : tc("created"));
      setShowRuleModal(false);
      setEditingId(null);
      setRuleForm(emptyRule);
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    } catch (error) {
      console.error("Save error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      let finalImageUrl = winnerForm.imageUrl;
      if (winnerImageFile) {
        finalImageUrl = await uploadImage(winnerImageFile, "challenge");
      }
      const payload = {
        ...winnerForm,
        imageUrl: finalImageUrl,
      };

      if (editingId) await api.put(`/api/challenge/winners/${editingId}`, payload);
      else await api.post("/api/challenge/winners", payload);
      setShowWinnerModal(false);
      setEditingId(null);
      setWinnerForm(emptyWinner);
      setWinnerImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    } catch (error) {
      console.error("Save error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleEditRule = (item: Rule) => {
    setEditingId(item.id);
    setRuleForm({
      title: item.title,
      description: item.description,
      position: "",
      isActive: item.isActive,
    });
    setFormError("");
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
    setWinnerImageFile(null);
    setFormError("");
    setShowWinnerModal(true);
  };

  const handleDeleteTrigger = (type: "rules" | "winners", id: string) => {
    setDeleteTarget({ type, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    try {
      await api.delete(`/api/challenge/${deleteTarget.type}/${deleteTarget.id}`);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
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

      <div className="flex items-center justify-between gap-4 mb-6 border-b border-border">
        <div className="flex gap-4">
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
        <div className="flex flex-wrap items-center gap-3">
          {tab === "winners" && (
            <button
              onClick={() => setShowReorderModal(true)}
              className="mb-3 bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {tc("reorder")}
            </button>
          )}
          <button
            onClick={() => {
              setEditingId(null);
              setFormError("");
              if (tab === "rules") {
                setRuleForm(emptyRule);
                setShowRuleModal(true);
              } else {
                setWinnerForm(emptyWinner);
                setShowWinnerModal(true);
              }
            }}
            className="mb-3 bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + {tab === "rules" ? t("addRule") : t("addWinner")}
          </button>
        </div>
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
          onReorder={reorderRules}
          getHighlightProps={ruleHighlight.getHighlightProps}
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
                {t("showingPage", {
                  page: winnersPage,
                  totalPages: totalWinnersPages,
                  total: totalWinners,
                })}
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
        error={formError}
      />

      <WinnerFormModal
        isOpen={showWinnerModal}
        editingId={editingId}
        form={winnerForm}
        setForm={setWinnerForm}
        onClose={() => {
          setShowWinnerModal(false);
          setEditingId(null);
          setWinnerImageFile(null);
        }}
        onSubmit={handleWinnerSubmit}
        imageFile={winnerImageFile}
        setImageFile={setWinnerImageFile}
        error={formError}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />

      <ReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        module="katanuki-winner"
        invalidateKeys={[["challenge"]]}
      />
    </>
  );
}
