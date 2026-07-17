"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-jp font-bold text-gold-400">
            {t("siteName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-foreground-secondary hover:text-gold-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Language */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/reservation"
            className="bg-gold-500 hover:bg-gold-600 text-background text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            {t("reservation")}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-foreground-secondary hover:text-gold-400 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-background-secondary border-t border-border">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-foreground-secondary hover:text-gold-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reservation"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gold-400 font-semibold"
            >
              {t("reservation")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
