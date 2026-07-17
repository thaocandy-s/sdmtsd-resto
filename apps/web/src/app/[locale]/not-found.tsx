import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations("common");

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gold-400 mb-4">404</h1>
        <p className="text-xl text-foreground-secondary mb-8">
          {t("notFound")}
        </p>
        <a
          href="/"
          className="inline-block bg-gold-500 hover:bg-gold-600 text-background font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {t("backHome")}
        </a>
      </div>
    </main>
  );
}
