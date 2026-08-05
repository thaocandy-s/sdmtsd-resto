"use client";

import { useEffect, useId, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "./form-error";

interface FormModalProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error?: string;
  isSaving?: boolean;
  submitLabel?: string;
  savingLabel?: string;
  cancelLabel?: string;
  overlayClassName?: string;
  contentClassName?: string;
  formClassName?: string;
  showFooter?: boolean;
  closeOnOverlayClick?: boolean;
  closeDisabled?: boolean;
  footerClassName?: string;
  submitClassName?: string;
  cancelClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
}

export function FormModal({
  isOpen,
  title,
  description,
  onClose,
  onSubmit,
  children,
  error,
  isSaving = false,
  submitLabel,
  savingLabel,
  cancelLabel,
  overlayClassName = "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4",
  contentClassName = "bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full",
  formClassName = "space-y-4",
  showFooter = true,
  closeOnOverlayClick = false,
  closeDisabled = false,
  footerClassName = "flex gap-3 pt-4",
  submitClassName = "flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  cancelClassName = "flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors",
  headerClassName = "flex items-center justify-between mb-6",
  titleClassName = "text-xl font-bold text-foreground",
  closeButtonClassName = "text-foreground-secondary hover:text-foreground text-2xl disabled:opacity-50",
}: FormModalProps) {
  const tc = useTranslations("common");
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDisabled, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={overlayClassName}
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && !closeDisabled && event.target === event.currentTarget)
          onClose();
      }}
    >
      <div className={contentClassName} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={headerClassName}>
          <div>
            <h3 id={titleId} className={titleClassName}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-foreground-secondary mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label={tc("cancel")}
            className={closeButtonClassName}
          >
            &times;
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={onSubmit} className={formClassName}>
            <FormError message={error || ""} />
            {children}
            {showFooter && (
              <div className={footerClassName}>
                <button type="submit" disabled={isSaving} className={submitClassName}>
                  {isSaving
                    ? (savingLabel ?? `${submitLabel ?? tc("save")}...`)
                    : (submitLabel ?? tc("save"))}
                </button>
                <button type="button" onClick={onClose} className={cancelClassName}>
                  {cancelLabel ?? tc("cancel")}
                </button>
              </div>
            )}
          </form>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
