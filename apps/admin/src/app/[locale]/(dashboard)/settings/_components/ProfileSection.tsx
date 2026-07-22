import { useTranslations } from "next-intl";

interface ProfileSectionProps {
  username: string;
  email: string;
  onChangeUsername: (val: string) => void;
}

export function ProfileSection({ username, email, onChangeUsername }: ProfileSectionProps) {
  const t = useTranslations("settings");

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
        {t("profileTitle")}
      </h3>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("username")} *</label>
        <input
          type="text"
          value={username}
          onChange={(e) => onChangeUsername(e.target.value)}
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("email")}</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2 text-foreground-secondary cursor-not-allowed text-sm"
        />
      </div>
    </div>
  );
}
