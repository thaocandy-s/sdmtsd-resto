"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useHighlightNew } from "@/shared/hooks/use-highlight-new";
import {
  Buffet,
  MenuItemOption,
  CategoryOption,
  BuffetFormData,
  emptyBuffetForm,
} from "./_components/types";
import { BuffetTable } from "./_components/BuffetTable";
import { BuffetFormModal } from "./_components/BuffetFormModal";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { ReorderModal } from "@/shared/components/reorder-modal";
import { uploadImage } from "@/shared/components/image-upload";

export default function BuffetMenuPage() {
  const t = useTranslations("buffetMenu");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filterStatus, setFilterStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BuffetFormData>(emptyBuffetForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Reorder Mode dialog state
  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus]);

  const buffetsQuery = useQuery({
    queryKey: ["buffets", { page: currentPage, search: debouncedSearch, status: filterStatus }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", currentPage.toString());
      params.set("limit", "10");
      return api.get<{ data: Buffet[]; meta?: { totalPages: number; total: number } }>(
        `/api/buffet?${params.toString()}`
      );
    },
    placeholderData: keepPreviousData,
  });

  // Heavy food/drink picker options are only fetched once the form modal opens
  const pickerOptionsQuery = useQuery({
    queryKey: ["buffet-picker-options"],
    enabled: showModal,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const [foodRes, drinkRes, foodCatRes, drinkCatRes] = await Promise.all([
        api.get<{ data: { id: string; name: string }[] }>("/api/menu?limit=500"),
        api.get<{ data: { id: string; name: string }[] }>("/api/drink?limit=500"),
        api.get<{ data: { id: string; name: string }[] }>("/api/menu/categories"),
        api.get<{ data: { id: string; name: string }[] }>("/api/drink/categories"),
      ]);
      const menuItems: MenuItemOption[] = [
        ...(foodRes.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          type: "food" as const,
        })),
        ...(drinkRes.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          type: "drink" as const,
        })),
      ];
      const categories: CategoryOption[] = [
        ...(foodCatRes.data || []).map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: "food" as const,
        })),
        ...(drinkCatRes.data || []).map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: "drink" as const,
        })),
      ];
      return { menuItems, categories };
    },
  });

  const buffets = buffetsQuery.data?.data ?? [];
  const totalPages = buffetsQuery.data?.meta?.totalPages ?? 1;
  const totalItems = buffetsQuery.data?.meta?.total ?? 0;
  const loading = buffetsQuery.isPending;
  const menuItems = pickerOptionsQuery.data?.menuItems ?? [];
  const categories = pickerOptionsQuery.data?.categories ?? [];

  const highlight = useHighlightNew();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/buffet/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buffets"] });
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      console.error("Delete buffet error:", error);
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "buffet-menu");
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
        includes: form.isAllMenu
          ? []
          : form.includes
            ? form.includes
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        notes: form.notes.trim() || null,
      };
      if (editingId) await api.put(`/api/buffet/${editingId}`, payload);
      else {
        const created = await api.post<{ data: { id: string } }>("/api/buffet", payload);
        highlight.flash(created.data.id);
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyBuffetForm);
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["buffets"] });
      toast.success(editingId ? tc("saved") : tc("created"));
    } catch (error) {
      console.error("Save buffet error:", error);
      setFormError(error instanceof Error ? error.message : "Save failed");
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
      isAllMenu: buffet.isAllMenu,
      notes: buffet.notes || "",
      imageUrl: buffet.imageUrl || "",
      isPopular: buffet.isPopular,
      position: "",
      status: buffet.status,
    });
    setImageFile(null);
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    setDeleteError("");
    deleteMutation.mutate(deleteConfirmId);
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-sm sm:text-base text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <button
            onClick={() => setShowReorderModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-background-secondary border border-border hover:bg-background-tertiary text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            {tc("reorder")}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyBuffetForm);
              setImageFile(null);
              setFormError("");
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-background px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            + {t("addCourse")}
          </button>
        </div>
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
        categories={categories}
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
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteError("");
        }}
      />

      <ReorderModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        module="buffet"
        invalidateKeys={[["buffets"]]}
      />
    </>
  );
}
