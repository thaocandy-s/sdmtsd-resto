"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { showSuccessToast, showWarningToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { BeerArt, FormData, emptyForm } from "./_components/types";
import { BeerArtList } from "./_components/BeerArtList";
import { BeerArtFormModal } from "./_components/BeerArtFormModal";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";
import { uploadImage } from "@/shared/components/image-upload";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";

export default function BeerArtPage() {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Reorder Mode dialog state
  const [showReorderModal, setShowReorderModal] = useState(false);

  const itemsQuery = useQuery({
    queryKey: ["beer-arts", { page: currentPage }],
    queryFn: () =>
      api.get<{ data: BeerArt[]; meta: { totalPages: number; total: number } }>(
        `/api/beer-art?page=${currentPage}&limit=10`
      ),
    placeholderData: keepPreviousData,
  });

  const items = itemsQuery.data?.data ?? [];
  const totalPages = itemsQuery.data?.meta?.totalPages ?? 1;
  const totalItems = itemsQuery.data?.meta?.total ?? 0;
  const loading = itemsQuery.isPending;

  const highlight = useHighlightNew();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl && !imageFile) {
      setFormError(tc("imageRequired"));
      showWarningToast(tc("imageRequired"));
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "beer-art");
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        await api.put(`/api/beer-art/${editingId}`, payload);
      } else {
        const created = await api.post<{ data: { id: string } }>("/api/beer-art", payload);
        highlight.flash(created.data.id);
      }
      showSuccessToast(editingId ? tc("saved") : tc("created"));
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["beer-arts"] });
    } catch (error) {
      console.error("Save error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: BeerArt) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      customerName: item.customerName || "",
      artistName: item.artistName || "",
      isPopular: item.isPopular,
      isPublished: item.isPublished,
      position: "",
    });
    setImageFile(null);
    setFormError("");
    setShowModal(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      await api.delete(`/api/beer-art/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["beer-arts"] });
      showSuccessToast(toastMessages.deleted);
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <button
            onClick={() => setShowReorderModal(true)}
            className="bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {tc("reorder")}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setImageFile(null);
              setFormError("");
              setShowModal(true);
            }}
            className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + {t("addItem")}
          </button>
        </div>
      </header>

      <BeerArtList
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteConfirmId(id)}
        getHighlightProps={highlight.getHighlightProps}
      />

      {/* Pagination Container */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-foreground-secondary">
            {t("showingPage", { page: currentPage, totalPages, total: totalItems })}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              {t("previous")}
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      <BeerArtFormModal
        isOpen={showModal}
        editingId={editingId}
        form={form}
        setForm={setForm}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
          setImageFile(null);
        }}
        onSubmit={handleSubmit}
        imageFile={imageFile}
        setImageFile={setImageFile}
        isSaving={isSaving}
        error={formError}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        error={deleteError}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />

      <ReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        module="beer-art"
        invalidateKeys={[["beer-arts"]]}
      />
    </>
  );
}
