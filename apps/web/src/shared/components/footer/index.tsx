import { FooterLogo } from "./FooterLogo";
import { FooterLinks } from "./FooterLinks";
import { FooterSocial } from "./FooterSocial";
import { FooterCopyright } from "./FooterCopyright";

interface FooterProps {
  initialInfo?: {
    logoUrl?: string | null;
    socialLinks?: any; // Json
  };
}

export function Footer({ initialInfo }: FooterProps) {
  // Server-provided restaurant info (no client fetch fallback)
  const socialLinks = initialInfo?.socialLinks
    ? (initialInfo.socialLinks as Record<string, string>)
    : null;
  const logoUrl = initialInfo?.logoUrl || "/images/logo.png";

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
