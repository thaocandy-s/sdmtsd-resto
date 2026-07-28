"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { FaqItem, FaqCategory, FaqForm, CatForm, emptyFaq, emptyCat } from "./_components/types";
import { FaqItemList } from "./_components/FaqItemList";
import { FaqCategoryList } from "./_components/FaqCategoryList";
import { FaqItemFormModal } from "./_components/FaqItemFormModal";
import { FaqCategoryFormModal } from "./_components/FaqCategoryFormModal";

export default function FaqPage() {
  const t = useTranslations("faq");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"items" | "categories">("items");

  // Modal State
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [faqForm, setFaqForm] = useState<FaqForm>(emptyFaq);
  const [catForm, setCatForm] = useState<CatForm>(emptyCat);
  const [formError, setFormError] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "items" | "categories";
    id: string;
  } | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["faqs"],
    queryFn: () => api.get<{ data: FaqItem[] }>("/api/faq"),
  });

  const categoriesQuery = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => api.get<{ data: FaqCategory[] }>("/api/faq/categories"),
    staleTime: 30 * 60 * 1000,
  });

  const items = itemsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const loading = itemsQuery.isPending || categoriesQuery.isPending;

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) await api.put(`/api/faq/${editingId}`, faqForm);
      else await api.post("/api/faq", faqForm);
      setShowFaqModal(false);
      setEditingId(null);
      setFaqForm(emptyFaq);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    } catch (error) {
      console.error("Save error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) await api.put(`/api/faq/categories/${editingId}`, catForm);
      else await api.post("/api/faq/categories", catForm);
      setShowCatModal(false);
      setEditingId(null);
      setCatForm(emptyCat);
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    } catch (error) {
      console.error("Save error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleEditFaq = (item: FaqItem) => {
    setEditingId(item.id);
    setFormError("");
    setFaqForm({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      categoryId: item.category?.id || "",
    });
    setShowFaqModal(true);
  };

  const handleEditCat = (item: FaqCategory) => {
    setEditingId(item.id);
    setFormError("");
    setCatForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      sortOrder: item.sortOrder,
    });
    setShowCatModal(true);
  };

  const handleDeleteTrigger = (type: "items" | "categories", id: string) => {
    setDeleteTarget({ type, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "items") {
        await api.delete(`/api/faq/${deleteTarget.id}`);
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
      } else {
        await api.delete(`/api/faq/categories/${deleteTarget.id}`);
        queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
      }
      setDeleteTarget(null);
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
            setFormError("");
            if (tab === "items") {
              setFaqForm(emptyFaq);
              setShowFaqModal(true);
            } else {
              setCatForm(emptyCat);
              setShowCatModal(true);
            }
          }}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + {tab === "items" ? t("addFaq") : t("addCategory")}
        </button>
      </header>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab("items")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "items"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("questionsTab")} ({items.length})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`pb-3 px-1 font-medium transition-colors ${
            tab === "categories"
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t("categoriesTab")} ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "items" ? (
        <FaqItemList
          items={items}
          onEdit={handleEditFaq}
          onDelete={(id) => handleDeleteTrigger("items", id)}
        />
      ) : (
        <FaqCategoryList
          categories={categories}
          onEdit={handleEditCat}
          onDelete={(id) => handleDeleteTrigger("categories", id)}
        />
      )}

      <FaqItemFormModal
        isOpen={showFaqModal}
        editingId={editingId}
        form={faqForm}
        categories={categories}
        error={formError}
        setForm={setFaqForm}
        onClose={() => {
          setShowFaqModal(false);
          setEditingId(null);
          setFormError("");
        }}
        onSubmit={handleFaqSubmit}
      />

      <FaqCategoryFormModal
        isOpen={showCatModal}
        editingId={editingId}
        form={catForm}
        error={formError}
        setForm={setCatForm}
        onClose={() => {
          setShowCatModal(false);
          setEditingId(null);
          setFormError("");
        }}
        onSubmit={handleCatSubmit}
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
