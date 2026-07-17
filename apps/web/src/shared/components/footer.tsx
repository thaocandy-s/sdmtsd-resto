import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <footer className="bg-background-secondary border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-gold-400 font-jp font-bold text-xl mb-4">
            {t("siteName")}
          </h3>
          <p className="text-foreground-secondary text-sm">
            {tf("description")}
          </p>
        </div>
        <div>
          <h4 className="text-foreground font-semibold mb-4">Quick Links</h4>
          <nav className="space-y-2">
            {[
              { href: "/menu", label: t("menu") },
              { href: "/drink", label: t("drink") },
              { href: "/reservation", label: t("reservation") },
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
          <h4 className="text-foreground font-semibold mb-4">Information</h4>
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
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border text-center text-foreground-tertiary text-sm">
        &copy; {new Date().getFullYear()} {t("siteName")}. {tf("copyright")}
      </div>
    </footer>
  );
}
