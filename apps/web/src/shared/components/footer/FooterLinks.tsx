import { useTranslations } from "next-intl";
import Link from "next/link";

export function FooterLinks() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <>
      <div>
        <h4 className="text-foreground font-semibold mb-4">{tf("quickLinks")}</h4>
        <nav className="space-y-2">
          {[
            { href: "/menu", label: t("menu") },
            { href: "/drink", label: t("drink") },
            { href: "/contact", label: t("contact") },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-foreground-secondary hover:text-gold-400 text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div>
        <h4 className="text-foreground font-semibold mb-4">{tf("information")}</h4>
        <nav className="space-y-2">
          <Link
            href="/info"
            className="block text-foreground-secondary hover:text-gold-400 text-sm transition-colors"
          >
            {t("info")}
          </Link>
          <Link
            href="/privacy"
            className="block text-foreground-secondary hover:text-gold-400 text-sm transition-colors"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="block text-foreground-secondary hover:text-gold-400 text-sm transition-colors"
          >
            {t("terms")}
          </Link>
        </nav>
      </div>
    </>
  );
}
