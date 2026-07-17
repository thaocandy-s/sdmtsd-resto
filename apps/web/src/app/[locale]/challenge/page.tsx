"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface Rule {
  id: string;
  title: string;
  description: string;
}

interface Winner {
  id: string;
  participantName: string;
  imageUrl: string | null;
  challengeName: string | null;
  discountAwarded: string | null;
  completedAt: string;
}

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
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-background-secondary rounded w-1/3" />
          <div className="h-40 bg-background-secondary rounded-lg" />
          <div className="h-10 bg-background-secondary rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-background-secondary rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Rules Section */}
      {rules.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">How to Play</h2>
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
      )}

      {/* Winners Gallery */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Winners</h2>
        {winners.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">
            No winners yet. Be the first!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="bg-background-secondary border border-border rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-background-tertiary">
                  {winner.imageUrl ? (
                    <img
                      src={winner.imageUrl}
                      alt={winner.participantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground truncate">{winner.participantName}</h3>
                  {winner.challengeName && (
                    <p className="text-xs text-foreground-secondary truncate">
                      {winner.challengeName}
                    </p>
                  )}
                  {winner.discountAwarded && (
                    <p className="text-xs text-gold-400 mt-1">{winner.discountAwarded}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
