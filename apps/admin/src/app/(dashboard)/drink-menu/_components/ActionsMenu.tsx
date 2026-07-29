"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function ActionsMenu({ onEdit, onDelete, onDuplicate }: ActionsMenuProps) {
  const t = useTranslations("drinkMenu");
  const tc = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        aria-label="Drink options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-36 bg-background-secondary border border-border rounded-xl shadow-lg z-20 py-1 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <button
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-background-tertiary flex items-center gap-2 transition-colors"
            role="menuitem"
          >
            <span>{tc("edit")}</span>
          </button>

          {onDuplicate && (
            <button
              onClick={() => {
                setIsOpen(false);
                onDuplicate();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-background-tertiary flex items-center gap-2 transition-colors"
              role="menuitem"
            >
              <span>{t("duplicate")}</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
            role="menuitem"
          >
            <span>{tc("delete")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
