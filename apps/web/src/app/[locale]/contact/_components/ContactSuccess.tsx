import { useTranslations } from "next-intl";

interface ContactSuccessProps {
  onReset: () => void;
}

export function ContactSuccess({ onReset }: ContactSuccessProps) {
  const t = useTranslations("contact");

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-green-400 mb-4">{t("successTitle")}</h2>
        <p className="text-foreground-secondary mb-6">{t("successDesc")}</p>
        <button
          onClick={onReset}
          className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
        >
          {t("sendAnother")}
        </button>
      </div>
    </main>
  );
}
