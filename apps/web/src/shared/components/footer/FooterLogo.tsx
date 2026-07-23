import { useTranslations } from "next-intl";

import Image from "next/image";

interface FooterLogoProps {
  logoUrl: string;
}

export function FooterLogo({ logoUrl }: FooterLogoProps) {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <div>
      <Image
        src={logoUrl}
        alt={t("siteName")}
        width={140}
        height={48}
        className="h-12 w-auto object-contain mb-4"
      />
      <p className="text-foreground-secondary text-sm">{tf("description")}</p>
    </div>
  );
}
