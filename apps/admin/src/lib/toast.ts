import { toast, type ExternalToast } from "sonner";
import ja from "@/constants/ja";

/**
 * Centralized toast helpers — the single entry point for user feedback.
 * Never use alert()/confirm() or ad-hoc toast implementations; always use
 * these helpers so position, duration and styling stay consistent
 * (global <Toaster /> is mounted once in shared/providers/index.tsx).
 */

const DEFAULT_DURATION = 4000;

export function showSuccessToast(message: string, options?: ExternalToast) {
  return toast.success(message, { duration: DEFAULT_DURATION, ...options });
}

export function showErrorToast(message: string, options?: ExternalToast) {
  return toast.error(message, { duration: DEFAULT_DURATION, ...options });
}

export function showWarningToast(message: string, options?: ExternalToast) {
  return toast.warning(message, { duration: DEFAULT_DURATION, ...options });
}

export function showInfoToast(message: string, options?: ExternalToast) {
  return toast.info(message, { duration: DEFAULT_DURATION, ...options });
}

/** Loading toast for long-running actions; dismiss via dismissToast(id). */
export function showLoadingToast(message: string, options?: ExternalToast) {
  return toast.loading(message, options);
}

export function dismissToast(id?: string | number) {
  toast.dismiss(id);
}

/** Standard Japanese feedback messages shared across all modules. */
export const toastMessages = ja.toast;

/**
 * Extracts a human-readable message from an unknown error (apiClient throws
 * Error with the server's `message`), falling back to a standard message.
 */
export function getErrorMessage(error: unknown, fallback: string = toastMessages.unexpectedError) {
  if (error instanceof TypeError) {
    // fetch network failures surface as TypeError ("Failed to fetch")
    return toastMessages.networkError;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/**
 * Shows the standard error toast for a failed API action.
 * Prefers the server-provided message, then the given fallback.
 */
export function showApiErrorToast(error: unknown, fallback?: string) {
  return showErrorToast(getErrorMessage(error, fallback));
}
