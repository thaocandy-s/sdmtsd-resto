"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Globe } from "lucide-react";

interface HeaderProps {
  initialInfo?: {
    phone?: string | null;
    logoUrl?: string | null;
    logoSubtitle?: string | null;
    name?: string | null;
  };
}

export function Header({ initialInfo }: HeaderProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState<string>(initialInfo?.phone || "+81-3-1234-5678");
  const [logoUrl, setLogoUrl] = useState<string>(initialInfo?.logoUrl || "/images/logo.png");
  const [logoSubtitle, setLogoSubtitle] = useState<string>(
    initialInfo && "logoSubtitle" in initialInfo
      ? initialInfo.logoSubtitle || ""
      : "鉄板・もんじゃ・居酒屋"
  );
  const [restaurantName, setRestaurantName] = useState<string>(
    initialInfo && "name" in initialInfo ? initialInfo.name || "" : "三代目土信田商店"
  );
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (initialInfo) return;
    fetch("/api/info")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          if (data.data.phone) setPhone(data.data.phone);
          if (data.data.logoUrl) setLogoUrl(data.data.logoUrl);

          // Support explicit null or empty values by checking if key exists
          if ("logoSubtitle" in data.data) {
            setLogoSubtitle(data.data.logoSubtitle || "");
          }
          if ("name" in data.data) {
            setRestaurantName(data.data.name || "");
          }
        }
      })
      .catch(console.error);
  }, [initialInfo]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleLanguage = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  const navItems = [
    { href: "/menu", label: t("menu") },
    { href: "/drink", label: t("drink") },
    { href: "/buffet", label: t("buffet") },
    { href: "/beer-art", label: t("beerArt") },
    { href: "/challenge", label: t("challenge") },
    { href: "/tourist", label: t("tourist") },
    { href: "/faq", label: t("faq") },
    { href: "/info", label: t("info") },
  ];

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 sm:gap-2"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src={logoUrl}
            alt={t("siteName")}
            width={120}
            height={40}
            priority
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          {(logoSubtitle || restaurantName) && (
            <div className="flex flex-col text-left leading-none font-jp font-medium select-none ml-1.5 lg:hidden flex-shrink-0">
              {logoSubtitle && (
                <span className="text-[9px] sm:text-[10.5px] text-foreground-secondary tracking-tight">
                  {logoSubtitle}
                </span>
              )}
              {restaurantName && (
                <span className="text-[12px] sm:text-[14px] text-gold-400 font-bold tracking-tighter mt-0.5">
                  {restaurantName}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="text-sm text-foreground-secondary hover:text-gold-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Language Switcher + Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold border border-border bg-background hover:bg-background-tertiary text-foreground transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-gold-400" />
            <span>{locale === "ja" ? "EN" : "JA"}</span>
          </button>

          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-background text-xs lg:text-sm font-semibold px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-md transition-colors"
            title={t("phoneCall")}
          >
            <Phone className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">{t("phoneCall")}</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground-secondary hover:text-gold-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-background-secondary border-t border-border">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-foreground-secondary hover:text-gold-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
