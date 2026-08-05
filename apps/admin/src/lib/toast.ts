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

function translateApiError(message: string): string | undefined {
  const linkedItems = message.match(
    /^Cannot delete: category still has (\d+) (food item|drink|place|FAQ)\(s\)\. Move or delete them first\.$/
  );
  if (linkedItems) {
    const labels: Record<string, string> = {
      "food item": "料理",
      drink: "ドリンク",
      place: "観光地",
      FAQ: "FAQ",
    };
    return `削除できません：カテゴリーに${labels[linkedItems[2]]}が${linkedItems[1]}件登録されています。先に${labels[linkedItems[2]]}を移動または削除してください。`;
  }

  const translations: Record<string, string> = {
    "Cannot modify ADMIN role": "ADMINロールは変更できません",
    "Cannot delete ADMIN role": "ADMINロールは削除できません",
    "Cannot delete yourself": "自分自身のユーザーは削除できません",
    "Cannot delete role with assigned users": "ユーザーが割り当てられているロールは削除できません",
    "Invalid credentials": "メールアドレスまたはパスワードが正しくありません",
    Unauthorized: "認証が必要です。もう一度ログインしてください",
    "Invalid input": toastMessages.validationError,
    "Slug already exists": "スラッグはすでに存在します",
    "Role name already exists": "ロール名はすでに存在します",
    "Email already exists": "メールアドレスはすでに存在します",
    "Username is already taken": "ユーザー名はすでに使用されています",
  };
  return translations[message];
}

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
    // API errors may still contain English implementation messages. Keep
    // those details out of the Japanese admin UI and use the contextual copy.
    const message = error.message;
    const translated = translateApiError(message);
    if (translated) return translated;
    if (!/[ぁ-んァ-ン一-龯]/.test(message) && /[A-Za-z]{2,}/.test(message)) {
      return fallback;
    }
    return message;
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
