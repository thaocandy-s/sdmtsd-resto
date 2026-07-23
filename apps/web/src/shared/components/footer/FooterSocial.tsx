import { useTranslations } from "next-intl";

interface FooterSocialProps {
  validSocialLinks: [string, string][];
}

export function FooterSocial({ validSocialLinks }: FooterSocialProps) {
  const tf = useTranslations("footer");

  if (validSocialLinks.length === 0) return null;

  return (
    <div>
      <h4 className="text-foreground font-semibold mb-4">{tf("followUs")}</h4>
      <div className="flex flex-col space-y-2">
        {validSocialLinks.map(([platform, url]) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-secondary hover:text-gold-400 text-sm capitalize transition-colors"
          >
            {platform}
          </a>
        ))}
      </div>
    </div>
  );
}
