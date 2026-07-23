import { useTranslations } from "next-intl";

export function FooterCopyright() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border text-center text-foreground-tertiary text-sm">
      &copy; {new Date().getFullYear()} {t("siteName")}. {tf("copyright")}
    </div>
  );
}
