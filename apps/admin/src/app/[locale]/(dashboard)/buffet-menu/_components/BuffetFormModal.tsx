"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toSlug } from "@resto-hub/utils";
import { ImageUpload } from "@/shared/components/image-upload";
import { BuffetFormData, MenuItemOption } from "./types";

interface BuffetFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: BuffetFormData;
  menuItems: MenuItemOption[];
  setForm: React.Dispatch<React.SetStateAction<BuffetFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BuffetFormModal({
  isOpen,
  editingId,
  form,
  menuItems,
  setForm,
  onClose,
  onSubmit,
}: BuffetFormModalProps) {
  const t = useTranslations("buffetMenu");
  const tc = useTranslations("common");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<"food" | "drink">("food");
  const [itemSearch, setItemSearch] = useState("");

  if (!isOpen) return null;

  const toggleIncludeItem = (name: string) => {
    const currentList = form.includes
      ? form.includes
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];
    const exists = currentList.includes(name);
    let newList: string[];
    if (exists) {
      newList = currentList.filter((item) => item !== name);
    } else {
      newList = [...currentList, name];
    }
    setForm({ ...form, includes: newList.join("\n") });
  };

  const currentIncludesArray = form.includes
    ? form.includes
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.type === selectedCategoryTab &&
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-background-secondary border border-border rounded-xl p-4 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-border/50">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            {editingId ? t("editCourse") : t("addCourse")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background-tertiary rounded-lg text-xl transition-colors"
          >
            &times;
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("nameLabel")} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({
                  ...form,
                  name,
                  slug: editingId ? form.slug : toSlug(name),
                });
              }}
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground-secondary mb-1">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("priceLabel")} *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("durationLabel")} *
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("minPeopleLabel")}
              </label>
              <input
                type="number"
                value={form.minPeople}
                onChange={(e) => setForm({ ...form, minPeople: e.target.value })}
                placeholder="e.g. 2"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("maxPeopleLabel")}
              </label>
              <input
                type="number"
                value={form.maxPeople}
                onChange={(e) => setForm({ ...form, maxPeople: e.target.value })}
                placeholder="e.g. 10"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Includes Selector */}
          <div className="border border-border rounded-lg p-3 sm:p-4 bg-background/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-sm font-medium text-foreground">
                {t("includesLabel")}
              </label>
              <span className="text-xs text-foreground-tertiary">{t("includesSelectorDesc")}</span>
            </div>

            {/* Selected Items Display Box */}
            <div className="min-h-[48px] p-2.5 border border-border rounded-lg bg-background flex flex-wrap gap-2 items-center">
              {currentIncludesArray.length === 0 ? (
                <span className="text-sm text-foreground-tertiary italic">
                  {t("noIncludesSelected")}
                </span>
              ) : (
                currentIncludesArray.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gold-500/20 border border-gold-500/50 text-gold-400 font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => toggleIncludeItem(item)}
                      className="hover:text-red-400 transition-colors text-xs font-bold leading-none p-0.5"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Tab Switcher & Search */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="flex bg-background-tertiary p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab("food")}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[36px] ${
                    selectedCategoryTab === "food"
                      ? "bg-gold-500 text-background"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {t("foodTab", { count: menuItems.filter((i) => i.type === "food").length })}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab("drink")}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[36px] ${
                    selectedCategoryTab === "drink"
                      ? "bg-gold-500 text-background"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {t("drinkTab", { count: menuItems.filter((i) => i.type === "drink").length })}
                </button>
              </div>
              <input
                type="text"
                placeholder={t("searchMenuPlaceholder")}
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Quick Pick Pills */}
            <div className="max-h-48 overflow-y-auto border border-border/50 rounded-lg p-2.5 flex flex-wrap gap-2 bg-background">
              {filteredMenuItems.length === 0 ? (
                <span className="text-sm text-foreground-tertiary p-2">
                  {t("noMenuItemsFound", { type: selectedCategoryTab })}
                </span>
              ) : (
                filteredMenuItems.map((item) => {
                  const isSelected = currentIncludesArray.includes(item.name);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleIncludeItem(item.name)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-all min-h-[36px] flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gold-500/20 border-gold-500 text-gold-400 font-medium"
                          : "bg-background-tertiary/50 border-border text-foreground-secondary hover:border-gold-500/50 hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            folder="buffet-menu"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("sortOrderLabel")}
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground-secondary mb-1">
                {t("statusLabel")}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-gold-500"
              >
                <option value="DRAFT">{tc("draft")}</option>
                <option value="PUBLISHED">{tc("published")}</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
              className="rounded border-border w-4 h-4 accent-gold-500"
            />
            <span className="text-sm text-foreground font-medium">{t("popularLabel")}</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              {editingId ? tc("save") : tc("add")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              {tc("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
