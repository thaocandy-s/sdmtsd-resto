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
  const [challengeImage, setChallengeImage] = useState<string>("/images/katanuki.png");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenge")
      .then((r) => r.json())
      .then((data) => {
        setRules(data.data?.rules || []);
        setWinners(data.data?.winners || []);
        if (data.data?.challengeImage) {
          setChallengeImage(data.data.challengeImage);
        }
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

      {/* Main Challenge Info & Rules Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch">
        <div className="relative min-h-[250px] md:min-h-full rounded-2xl overflow-hidden border border-border bg-background-secondary shadow-lg group">
          <img
            src={challengeImage}
            alt="Katanuki Challenge Illustration"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-6">
            <div>
              <span className="text-gold-400 text-xs font-semibold tracking-wider uppercase block mb-1">
                Katanuki Challenge
              </span>
              <span className="text-white text-lg font-bold font-jp">型抜きチャレンジ</span>
            </div>
          </div>
        </div>
        <ChallengeRules rules={rules} />
      </div>

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
