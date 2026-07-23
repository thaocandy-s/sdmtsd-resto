import { useTranslations } from "next-intl";

interface FooterLogoProps {
  logoUrl: string;
}

export function FooterLogo({ logoUrl }: FooterLogoProps) {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <div>
      <img src={logoUrl} alt={t("siteName")} className="h-12 w-auto object-contain mb-4" />
      <p className="text-foreground-secondary text-sm">{tf("description")}</p>
    </div>
  );
}
