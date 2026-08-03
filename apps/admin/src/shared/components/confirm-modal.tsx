import { useTranslations } from "next-intl";
import { FormError } from "@/shared/components/form-error";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  error?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  error,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const tc = useTranslations("common");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground-secondary mb-6">{message}</p>
        {error && (
          <div className="mb-4">
            <FormError message={error} />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-background-tertiary hover:bg-background border border-border text-foreground rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tc("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <span>{tc("delete")}...</span>
              </span>
            ) : (
              tc("delete")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
