import { useTranslations } from "next-intl";

interface PasswordSectionProps {
  password: string;
  confirmPassword: string;
  onChangePassword: (val: string) => void;
  onChangeConfirmPassword: (val: string) => void;
}

export function PasswordSection({
  password,
  confirmPassword,
  onChangePassword,
  onChangeConfirmPassword,
}: PasswordSectionProps) {
  const t = useTranslations("settings");

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
        {t("passwordTitle")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">{t("newPassword")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">
            {t("confirmPassword")}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onChangeConfirmPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
