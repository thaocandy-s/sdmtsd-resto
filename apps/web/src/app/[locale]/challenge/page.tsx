"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { ChallengeSkeleton } from "./components/challenge-skeleton";
import { ChallengeRules, Rule } from "./components/challenge-rules";
import { WinnerCard, Winner } from "./components/winner-card";

export default function ChallengePage() {
  const t = useTranslations("challenge");
  const [rules, setRules] = useState<Rule[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenge")
      .then((r) => r.json())
      .then((data) => {
        setRules(data.data?.rules || []);
        setWinners(data.data?.winners || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ChallengeSkeleton />;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Rules Section */}
      <ChallengeRules rules={rules} />

      {/* Winners Gallery */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">{t("recentWinners")}</h2>
        {winners.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">{t("noWinners")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {winners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
