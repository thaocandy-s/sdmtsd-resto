"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { Buffet, MenuItemOption, BuffetFormData, emptyBuffetForm } from "./_components/types";
import { BuffetTable } from "./_components/BuffetTable";
import { BuffetFormModal } from "./_components/BuffetFormModal";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { uploadImage } from "@/shared/components/image-upload";

export default function BuffetMenuPage() {
  const t = useTranslations("buffetMenu");
  const tc = useTranslations("common");
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BuffetFormData>(emptyBuffetForm);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  useEffect(() => {
    loadData();
  }, [currentPage, search, filterStatus]);

  const loadMenuItems = async () => {
    try {
      const [foodRes, drinkRes] = await Promise.all([
        api.get<{ data: { id: string; name: string }[] }>("/api/menu?limit=500"),
        api.get<{ data: { id: string; name: string }[] }>("/api/drink?limit=500"),
      ]);
      const foods: MenuItemOption[] = (foodRes.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: "food",
      }));
      const drinks: MenuItemOption[] = (drinkRes.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: "drink",
      }));
      setMenuItems([...foods, ...drinks]);
    } catch (error) {
      console.error("Load menu items error:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      const res = await api.get<{ data: Buffet[]; meta?: { totalPages: number; total: number } }>(
        `/api/buffet?${params.toString()}`
      );
      setBuffets(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);
    } catch (error) {
      console.error("Load buffets error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "buffet-menu");
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
        includes: form.includes
          ? form.includes
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };
      if (editingId) await api.put(`/api/buffet/${editingId}`, payload);
      else await api.post("/api/buffet", payload);
      setShowModal(false);
      setEditingId(null);
      setForm(emptyBuffetForm);
      setImageFile(null);
      loadData();
    } catch (error) {
      console.error("Save buffet error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (buffet: Buffet) => {
    setEditingId(buffet.id);
    setForm({
      name: buffet.name,
      slug: buffet.slug,
      description: buffet.description || "",
      price: buffet.price.toString(),
      duration: buffet.duration.toString(),
      minPeople:
        buffet.minPeople !== null && buffet.minPeople !== undefined
          ? buffet.minPeople.toString()
          : "",
      maxPeople:
        buffet.maxPeople !== null && buffet.maxPeople !== undefined
          ? buffet.maxPeople.toString()
          : "",
      includes: Array.isArray(buffet.includes) ? buffet.includes.join("\n") : "",
      imageUrl: buffet.imageUrl || "",
      isPopular: buffet.isPopular,
      sortOrder: buffet.sortOrder?.toString() || "0",
      status: buffet.status,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/buffet/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error("Delete buffet error:", error);
    }
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-sm sm:text-base text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyBuffetForm);
            setImageFile(null);
            setShowModal(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
        >
          + {t("addCourse")}
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:flex-1 bg-background-secondary border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-gold-500 text-sm min-h-[44px]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto bg-background-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-gold-500 text-sm min-h-[44px]"
        >
          <option value="">{t("statusFilter")}</option>
          <option value="DRAFT">{tc("draft")}</option>
          <option value="PUBLISHED">{tc("published")}</option>
        </select>
      </div>

      <BuffetTable
        buffets={buffets}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      <BuffetFormModal
        isOpen={showModal}
        editingId={editingId}
        form={form}
        menuItems={menuItems}
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
