import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("common");

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-8">
        {t("privacy")}
      </h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-foreground-secondary">
          Privacy policy content will be added here.
        </p>
      </div>
    </main>
  );
}
