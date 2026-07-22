"use client";

import { useTranslations } from "next-intl";

export interface Rule {
  id: string;
  title: string;
  description: string;
}

interface ChallengeRulesProps {
  rules: Rule[];
}

export function ChallengeRules({ rules }: ChallengeRulesProps) {
  const t = useTranslations("challenge");

  if (rules.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t("howToPlay")}</h2>
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className="bg-background-secondary border border-border rounded-lg p-4 flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{rule.title}</h3>
              <p className="text-foreground-secondary text-sm mt-1">{rule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
