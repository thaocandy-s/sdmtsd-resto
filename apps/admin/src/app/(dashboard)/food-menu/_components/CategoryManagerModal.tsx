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
  const t = useTranslations("foodMenu");
  const tc = useTranslations("common");
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>(emptyCategoryForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      if (editingCatId) {
        await api.put(`/api/menu/categories/${editingCatId}`, catForm);
      } else {
        await api.post("/api/menu/categories", catForm);
      }
      setEditingCatId(null);
      setIsAddingCat(false);
      setCatForm(emptyCategoryForm);
      onDataChange();
      showSuccessToast(editingCatId ? toastMessages.saved : toastMessages.created);
    } catch (error) {
      console.error("Save food category error:", error);
      setError(error instanceof Error ? error.message : "Save failed");
      showApiErrorToast(error, toastMessages.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCatEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      position: "",
    });
    setIsAddingCat(true);
  };

  const handleCatDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setError("");
    setIsDeleting(true);
    try {
      await api.delete(`/api/menu/categories/${deleteConfirmId}`);
      onDataChange();
      showSuccessToast(toastMessages.deleted);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Delete food category error:", error);
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
              {error && <FormError message={error} />}
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

              <AdvancedSection title={tc("advancedOptions")}>
                <PositionField
                  value={catForm.position}
                  onChange={(v) => setCatForm({ ...catForm, position: v })}
                  label={tc("positionLabel")}
                  hint={tc("positionHint")}
                />
              </AdvancedSection>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-background px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-background"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {editingCatId ? tc("save") : tc("add")}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsAddingCat(false);
                    setEditingCatId(null);
                    setCatForm(emptyCategoryForm);
                  }}
                  className="bg-background-tertiary hover:bg-background border border-border text-foreground px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
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
                  </div>
                  <div className="text-xs bg-background-tertiary px-2 py-0.5 rounded text-foreground-secondary whitespace-nowrap shrink-0">
                    {cat._count?.foods ?? 0} {t("itemsCount")}
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
