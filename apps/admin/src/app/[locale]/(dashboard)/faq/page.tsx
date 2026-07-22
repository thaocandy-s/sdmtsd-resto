"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

  const [tab, setTab] = useState<"items" | "categories">("items");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [faqForm, setFaqForm] = useState<FaqForm>(emptyFaq);
  const [catForm, setCatForm] = useState<CatForm>(emptyCat);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "items" | "categories";
    id: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, cRes] = await Promise.all([
        api.get<{ data: FaqItem[] }>("/api/faq"),
        api.get<{ data: FaqCategory[] }>("/api/faq/categories"),
      ]);
      setItems(fRes.data || []);
      setCategories(cRes.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...faqForm, categoryId: faqForm.categoryId || null };
    try {
      if (editingId) await api.put(`/api/faq/${editingId}`, payload);
      else await api.post("/api/faq", payload);
      setShowFaqModal(false);
      setEditingId(null);
      setFaqForm(emptyFaq);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/api/faq/categories/${editingId}`, catForm);
      else await api.post("/api/faq/categories", catForm);
      setShowCatModal(false);
      setEditingId(null);
      setCatForm(emptyCat);
      loadData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEditFaq = (item: FaqItem) => {
    setEditingId(item.id);
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
      } else {
        await api.delete(`/api/faq/categories/${deleteTarget.id}`);
      }
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
        setForm={setFaqForm}
        onClose={() => {
          setShowFaqModal(false);
          setEditingId(null);
        }}
        onSubmit={handleFaqSubmit}
      />

      <FaqCategoryFormModal
        isOpen={showCatModal}
        editingId={editingId}
        form={catForm}
        setForm={setCatForm}
        onClose={() => {
          setShowCatModal(false);
          setEditingId(null);
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
