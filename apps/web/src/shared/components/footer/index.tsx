"use client";

import { useState, useEffect } from "react";
import { FooterLogo } from "./FooterLogo";
import { FooterLinks } from "./FooterLinks";
import { FooterSocial } from "./FooterSocial";
import { FooterCopyright } from "./FooterCopyright";

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<Record<string, string> | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.png");

  useEffect(() => {
    fetch("/api/info")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.socialLinks) {
          setSocialLinks(data.data.socialLinks);
        }
        if (data?.data?.logoUrl) {
          setLogoUrl(data.data.logoUrl);
        }
      })
      .catch(console.error);
  }, []);

  const validSocialLinks = Object.entries(socialLinks || {}).filter(
    ([_, url]) => typeof url === "string" && url.trim().length > 0
  );

  return (
    <footer className="bg-background-secondary border-t border-border py-12 px-4">
      <div
        className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 ${
          validSocialLinks.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        } gap-8`}
      >
        <FooterLogo logoUrl={logoUrl} />
        <FooterLinks />
        <FooterSocial validSocialLinks={validSocialLinks} />
      </div>
      <FooterCopyright />
    </footer>
  );
}
