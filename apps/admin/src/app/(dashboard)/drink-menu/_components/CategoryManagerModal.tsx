import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { showSuccessToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { FormError } from "@/shared/components/form-error";
import { AdvancedSection, PositionField } from "@/shared/components/advanced-section";
import { SortableList, OrderBadge } from "@/shared/components/sortable-list";
import { Category, CategoryFormData, emptyCategoryForm, toSlug } from "./types";

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onDataChange: () => void;
  onReorder?: (orderedIds: string[]) => void;
  getHighlightProps?: (id: string) => { "data-highlight-id": string; className: string };
}

export function CategoryManagerModal({
  isOpen,
  categories,
  onClose,
  onDataChange,
  onReorder,
  getHighlightProps,
}: CategoryManagerModalProps) {
  const t = useTranslations("drinkMenu");
  const tc = useTranslations("common");
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>(emptyCategoryForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingCatId) {
        await api.put(`/api/drink/categories/${editingCatId}`, catForm);
      } else {
        await api.post("/api/drink/categories", catForm);
      }
      setEditingCatId(null);
      setIsAddingCat(false);
      setCatForm(emptyCategoryForm);
      onDataChange();
      showSuccessToast(editingCatId ? toastMessages.saved : toastMessages.created);
    } catch (error) {
      console.error("Save category error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    }
  };

  const handleCatEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setError("");
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      position: "",
    });
    setIsAddingCat(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleCatDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setError("");
    setIsDeleting(true);
    try {
      await api.delete(`/api/drink/categories/${deleteConfirmId}`);
      onDataChange();
      showSuccessToast(toastMessages.deleted);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Delete category error:", error);
      setError(error instanceof Error ? error.message : "Delete failed");
      showApiErrorToast(error, toastMessages.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setIsAddingCat(false);
    setEditingCatId(null);
    setCatForm(emptyCategoryForm);
    setError("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{t("categoriesTitle")}</h3>
              <p className="text-sm text-foreground-secondary mt-0.5">{t("categoriesSubtitle")}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-foreground-secondary hover:text-foreground text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Category Form */}
          {isAddingCat ? (
            <form
              onSubmit={handleCatSubmit}
              className="bg-background border border-border rounded-lg p-4 space-y-4"
            >
              <h4 className="font-semibold text-gold-400">
                {editingCatId ? t("editCategory") : t("addCategory")}
              </h4>
              <div>
                <label className="block text-xs text-foreground-secondary mb-1">
                  {t("nameLabel")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCatForm({ ...catForm, name, slug: toSlug(name) });
                  }}
                  required
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-secondary mb-1">
                  {t("descWithDisplay")}
                </label>
                <textarea
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  rows={2}
                  placeholder={t("descPlaceholder")}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
                />
              </div>
              <AdvancedSection title={tc("advancedOptions")}>
                <PositionField
                  value={catForm.position}
                  onChange={(v) => setCatForm({ ...catForm, position: v })}
                  label={tc("positionLabel")}
                  hint={tc("positionHint")}
                />
              </AdvancedSection>
              <FormError message={error} />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {editingCatId ? tc("save") : tc("add")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCat(false);
                    setEditingCatId(null);
                    setCatForm(emptyCategoryForm);
                  }}
                  className="bg-background-tertiary hover:bg-background border border-border text-foreground px-4 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {tc("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setIsAddingCat(true);
                setEditingCatId(null);
                setCatForm(emptyCategoryForm);
                setError("");
              }}
              className="w-full py-2 border border-dashed border-gold-500/50 hover:border-gold-500 text-gold-400 rounded-lg text-sm font-medium transition-colors text-center"
            >
              + {t("addCategory")}
            </button>
          )}

          {/* Category List (drag & drop to reorder) */}
          {!isAddingCat && error && <FormError message={error} />}
          <SortableList
            items={categories}
            onReorder={onReorder ?? (() => {})}
            className="space-y-2"
            renderItem={(cat, index, handle) => {
              const hp = getHighlightProps?.(cat.id) ?? {
                "data-highlight-id": cat.id,
                className: "",
              };
              return (
                <div
                  {...hp}
                  className={`bg-background border border-border rounded-lg p-3 flex items-center gap-3 ${hp.className}`}
                >
                  {handle}
                  <OrderBadge order={index + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{cat.name}</div>
                    <div className="text-xs text-foreground-tertiary truncate">
                      {cat.slug}
                      {cat.description ? ` · ${cat.description}` : ""}
                    </div>
                  </div>
                  <div className="text-xs bg-background-tertiary px-2 py-0.5 rounded text-foreground-secondary whitespace-nowrap shrink-0">
                    {cat._count?.drinks ?? 0} {t("itemsCount")}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleCatEdit(cat)}
                      className="text-gold-400 hover:text-gold-300 text-xs font-medium"
                    >
                      {tc("edit")}
                    </button>
                    <button
                      onClick={() => handleCatDelete(cat.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      {tc("delete")}
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={tc("delete")}
        message={t("deleteCategoryConfirm")}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
