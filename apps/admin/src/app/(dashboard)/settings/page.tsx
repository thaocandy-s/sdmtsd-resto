"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { api } from "@/lib/api-client";
import { showSuccessToast, showWarningToast, showApiErrorToast, toastMessages } from "@/lib/toast";
import { ProfileSection } from "./_components/ProfileSection";
import { PasswordSection } from "./_components/PasswordSection";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showWarningToast(t("passwordsNotMatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await api.put<{ data: any }>("/api/users/profile", {
        username,
        password: password || undefined,
      });

      // Update Zustand auth store
      if (res.data) {
        useAuthStore.setState({
          user: {
            ...user!,
            username: res.data.username,
          },
        });
      }

      showSuccessToast(password ? toastMessages.passwordChanged : t("updateSuccess"));
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      showApiErrorToast(err, toastMessages.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfileSection
          username={username}
          email={user?.email || ""}
          onChangeUsername={setUsername}
        />

        <PasswordSection
          password={password}
          confirmPassword={confirmPassword}
          onChangePassword={setPassword}
          onChangeConfirmPassword={setConfirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 disabled:bg-gold-500/50 text-background px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          {loading ? t("updating") : t("saveChanges")}
        </button>
      </form>
    </div>
  );
}
