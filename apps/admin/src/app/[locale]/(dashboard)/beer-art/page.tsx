"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { BeerArt, FormData, emptyForm } from "./_components/types";
import { BeerArtList } from "./_components/BeerArtList";
import { BeerArtFormModal } from "./_components/BeerArtFormModal";
import { ConfirmModal } from "@/shared/components/confirm-modal";

export default function BeerArtPage() {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");
  const [items, setItems] = useState<BeerArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        data: BeerArt[];
        meta: { totalPages: number; total: number };
      }>(`/api/beer-art?page=${currentPage}&limit=10`);
      setItems(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);
    } catch (error) {
      console.error("Load beer art error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/beer-art/${editingId}`, form);
      else await api.post("/api/beer-art", form);
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
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
      isPublished: item.isPublished,
    });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/beer-art/${deleteConfirmId}`);
      setDeleteConfirmId(null);
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
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + {t("addItem")}
        </button>
      </header>

      <BeerArtList
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteConfirmId(id)}
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
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
