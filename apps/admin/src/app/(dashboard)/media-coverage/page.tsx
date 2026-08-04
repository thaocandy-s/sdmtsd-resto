"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { showSuccessToast, showWarningToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import {
  MediaCoverage,
  MediaOutlet,
  ArticleFormData,
  OutletFormData,
  emptyArticleForm,
  emptyOutletForm,
} from "./_components/types";
import { MediaCoverageFilters } from "./_components/MediaCoverageFilters";
import { MediaCoverageList } from "./_components/MediaCoverageList";
import { MediaCoverageFormModal } from "./_components/MediaCoverageFormModal";
import { MediaOutletList } from "./_components/MediaOutletList";
import { MediaOutletFormModal } from "./_components/MediaOutletFormModal";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";
import { uploadImage } from "@/shared/components/image-upload";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export default function MediaCoveragePage() {
  const t = useTranslations("mediaCoverage");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"articles" | "outlets">("articles");

  // Articles state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleFormData>(emptyArticleForm);
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [articleFormError, setArticleFormError] = useState("");
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [deleteArticleError, setDeleteArticleError] = useState("");
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);
  const [showArticleReorder, setShowArticleReorder] = useState(false);
  const [articlePage, setArticlePage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  // Outlets state
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);
  const [outletForm, setOutletForm] = useState<OutletFormData>(emptyOutletForm);
  const [outletLogoFile, setOutletLogoFile] = useState<File | null>(null);
  const [outletFormError, setOutletFormError] = useState("");
  const [isSavingOutlet, setIsSavingOutlet] = useState(false);
  const [deleteOutletId, setDeleteOutletId] = useState<string | null>(null);
  const [deleteOutletError, setDeleteOutletError] = useState("");
  const [isDeletingOutlet, setIsDeletingOutlet] = useState(false);
  const [showOutletReorder, setShowOutletReorder] = useState(false);

  const articleHighlight = useHighlightNew();
  const outletHighlight = useHighlightNew();

  const articlesQuery = useQuery({
    queryKey: [
      "media-coverage",
      {
        page: articlePage,
        search: debouncedSearch,
        category: filterCategory,
        status: filterStatus,
      },
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(articlePage),
        limit: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      return api.get<{ data: MediaCoverage[]; meta: { totalPages: number; total: number } }>(
        `/api/media-coverage?${params}`
      );
    },
    placeholderData: keepPreviousData,
  });

  const outletsQuery = useQuery({
    queryKey: ["media-outlets"],
    queryFn: () =>
      api.get<{ data: MediaOutlet[]; meta: { totalPages: number; total: number } }>(
        "/api/media-outlets?limit=50"
      ),
  });

  const articles = articlesQuery.data?.data ?? [];
  const articleTotalPages = articlesQuery.data?.meta?.totalPages ?? 1;
  const articleTotal = articlesQuery.data?.meta?.total ?? 0;
  const articlesLoading = articlesQuery.isPending;

  const outlets = outletsQuery.data?.data ?? [];
  const outletsLoading = outletsQuery.isPending;

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.imageUrl && !articleImageFile) {
      setArticleFormError(tc("imageRequired"));
      showWarningToast(tc("imageRequired"));
      return;
    }
    if (!articleForm.category) {
      setArticleFormError(t("categoryRequired"));
      return;
    }
    setIsSavingArticle(true);
    setArticleFormError("");
    try {
      let finalImageUrl = articleForm.imageUrl;
      if (articleImageFile) {
        finalImageUrl = await uploadImage(articleImageFile, "media-coverage");
      }
      const payload = {
        ...articleForm,
        imageUrl: finalImageUrl,
        category: articleForm.category,
      };
      if (editingArticleId) {
        await api.put(`/api/media-coverage/${editingArticleId}`, payload);
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/media-coverage", payload);
        articleHighlight.flash(created.data.id);
      }
      showSuccessToast(editingArticleId ? tc("saved") : tc("created"));
      setShowArticleModal(false);
      setEditingArticleId(null);
      setArticleForm(emptyArticleForm);
      setArticleImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["media-coverage"] });
    } catch (error) {
      setArticleFormError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleEditArticle = (item: MediaCoverage) => {
    setEditingArticleId(item.id);
    setArticleForm({
      publishedAt: item.publishedAt.slice(0, 10),
      mediaName: item.mediaName,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      externalUrl: item.externalUrl,
      category: item.category,
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      position: "",
    });
    setArticleImageFile(null);
    setArticleFormError("");
    setShowArticleModal(true);
  };

  const handleConfirmDeleteArticle = async () => {
    if (!deleteArticleId) return;
    setDeleteArticleError("");
    setIsDeletingArticle(true);
    try {
      await api.delete(`/api/media-coverage/${deleteArticleId}`);
      setDeleteArticleId(null);
      queryClient.invalidateQueries({ queryKey: ["media-coverage"] });
      showSuccessToast(toastMessages.deleted);
    } catch (error) {
      setDeleteArticleError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    } finally {
      setIsDeletingArticle(false);
    }
  };

  const handleOutletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletForm.logoUrl && !outletLogoFile) {
      setOutletFormError(tc("imageRequired"));
      showWarningToast(tc("imageRequired"));
      return;
    }
    setIsSavingOutlet(true);
    setOutletFormError("");
    try {
      let finalLogoUrl = outletForm.logoUrl;
      if (outletLogoFile) {
        finalLogoUrl = await uploadImage(outletLogoFile, "media-outlets");
      }
      const payload = { ...outletForm, logoUrl: finalLogoUrl };
      if (editingOutletId) {
        await api.put(`/api/media-outlets/${editingOutletId}`, payload);
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/media-outlets", payload);
        outletHighlight.flash(created.data.id);
      }
      showSuccessToast(editingOutletId ? tc("saved") : tc("created"));
      setShowOutletModal(false);
      setEditingOutletId(null);
      setOutletForm(emptyOutletForm);
      setOutletLogoFile(null);
      queryClient.invalidateQueries({ queryKey: ["media-outlets"] });
    } catch (error) {
      setOutletFormError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSavingOutlet(false);
    }
  };

  const handleEditOutlet = (item: MediaOutlet) => {
    setEditingOutletId(item.id);
    setOutletForm({
      name: item.name,
      logoUrl: item.logoUrl,
      websiteUrl: item.websiteUrl || "",
      isActive: item.isActive,
      position: "",
    });
    setOutletLogoFile(null);
    setOutletFormError("");
    setShowOutletModal(true);
  };

  const handleConfirmDeleteOutlet = async () => {
    if (!deleteOutletId) return;
    setDeleteOutletError("");
    setIsDeletingOutlet(true);
    try {
      await api.delete(`/api/media-outlets/${deleteOutletId}`);
      setDeleteOutletId(null);
      queryClient.invalidateQueries({ queryKey: ["media-outlets"] });
      showSuccessToast(toastMessages.deleted);
    } catch (error) {
      setDeleteOutletError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    } finally {
      setIsDeletingOutlet(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
      </header>

      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "articles"
              ? "border-gold-500 text-gold-400"
              : "border-transparent text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("articlesTab")}
        </button>
        <button
          onClick={() => setActiveTab("outlets")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "outlets"
              ? "border-gold-500 text-gold-400"
              : "border-transparent text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("outletsTab")}
        </button>
      </div>

      {activeTab === "articles" && (
        <>
          <div className="flex flex-wrap items-stretch justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowArticleReorder(true)}
                className="bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {tc("reorder")}
              </button>
            </div>
            <button
              onClick={() => {
                setEditingArticleId(null);
                setArticleForm(emptyArticleForm);
                setArticleImageFile(null);
                setArticleFormError("");
                setShowArticleModal(true);
              }}
              className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t("addArticle")}
            </button>
          </div>

          <MediaCoverageFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setArticlePage(1);
            }}
            filterCategory={filterCategory}
            onCategoryChange={(v) => {
              setFilterCategory(v);
              setArticlePage(1);
            }}
            filterStatus={filterStatus}
            onStatusChange={(v) => {
              setFilterStatus(v);
              setArticlePage(1);
            }}
          />

          <MediaCoverageList
            items={articles}
            loading={articlesLoading}
            onEdit={handleEditArticle}
            onDelete={(id) => setDeleteArticleId(id)}
            getHighlightProps={articleHighlight.getHighlightProps}
          />

          {!articlesLoading && articleTotalPages > 1 && (
            <div className="mt-8 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-foreground-secondary">
                {t("showingPage", {
                  page: articlePage,
                  totalPages: articleTotalPages,
                  total: articleTotal,
                })}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setArticlePage(Math.max(articlePage - 1, 1))}
                  disabled={articlePage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("previous")}
                </button>
                <button
                  onClick={() => setArticlePage(Math.min(articlePage + 1, articleTotalPages))}
                  disabled={articlePage === articleTotalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "outlets" && (
        <>
          <div className="flex flex-wrap items-stretch justify-end gap-3 mb-6">
            <button
              onClick={() => setShowOutletReorder(true)}
              className="bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {tc("reorder")}
            </button>
            <button
              onClick={() => {
                setEditingOutletId(null);
                setOutletForm(emptyOutletForm);
                setOutletLogoFile(null);
                setOutletFormError("");
                setShowOutletModal(true);
              }}
              className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t("addOutlet")}
            </button>
          </div>

          <MediaOutletList
            items={outlets}
            loading={outletsLoading}
            onEdit={handleEditOutlet}
            onDelete={(id) => setDeleteOutletId(id)}
            getHighlightProps={outletHighlight.getHighlightProps}
          />
        </>
      )}

      <MediaCoverageFormModal
        isOpen={showArticleModal}
        editingId={editingArticleId}
        form={articleForm}
        setForm={setArticleForm}
        onClose={() => {
          setShowArticleModal(false);
          setEditingArticleId(null);
          setArticleImageFile(null);
        }}
        onSubmit={handleArticleSubmit}
        imageFile={articleImageFile}
        setImageFile={setArticleImageFile}
        isSaving={isSavingArticle}
        error={articleFormError}
      />

      <MediaOutletFormModal
        isOpen={showOutletModal}
        editingId={editingOutletId}
        form={outletForm}
        setForm={setOutletForm}
        onClose={() => {
          setShowOutletModal(false);
          setEditingOutletId(null);
          setOutletLogoFile(null);
        }}
        onSubmit={handleOutletSubmit}
        logoFile={outletLogoFile}
        setLogoFile={setOutletLogoFile}
        isSaving={isSavingOutlet}
        error={outletFormError}
      />

      <ConfirmModal
        isOpen={deleteArticleId !== null}
        title={tc("delete")}
        message={t("deleteArticleConfirm")}
        error={deleteArticleError}
        isLoading={isDeletingArticle}
        onConfirm={handleConfirmDeleteArticle}
        onCancel={() => {
          setDeleteArticleId(null);
          setDeleteArticleError("");
        }}
      />

      <ConfirmModal
        isOpen={deleteOutletId !== null}
        title={tc("delete")}
        message={t("deleteOutletConfirm")}
        error={deleteOutletError}
        isLoading={isDeletingOutlet}
        onConfirm={handleConfirmDeleteOutlet}
        onCancel={() => {
          setDeleteOutletId(null);
          setDeleteOutletError("");
        }}
      />

      <ReorderModal
        isOpen={showArticleReorder}
        onClose={() => setShowArticleReorder(false)}
        module="media-coverage"
        invalidateKeys={[["media-coverage"]]}
      />

      <ReorderModal
        isOpen={showOutletReorder}
        onClose={() => setShowOutletReorder(false)}
        module="media-outlet"
        invalidateKeys={[["media-outlets"]]}
      />
    </>
  );
}
