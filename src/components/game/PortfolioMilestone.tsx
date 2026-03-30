"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency } from "@/lib/utils";

const MILESTONES = [
  { amount: 15000, title: "Rising Star", emoji: "\u2B50", desc: "Portfolio reached $15,000!" },
  { amount: 20000, title: "Double Up!", emoji: "\uD83D\uDE80", desc: "You doubled your starting capital!" },
  { amount: 30000, title: "Triple Threat", emoji: "\uD83D\uDC8E", desc: "3x your starting balance!" },
  { amount: 50000, title: "Fifty Grand!", emoji: "\uD83C\uDFC6", desc: "Half way to $100k!" },
  { amount: 75000, title: "Almost There!", emoji: "\uD83D\uDD25", desc: "$75,000 and counting!" },
  { amount: 100000, title: "Six Figures!", emoji: "\uD83D\uDC51", desc: "The $100k club — legendary!" },
];

const MILESTONE_KEY = "swipetrade-portfolio-milestones";

export default function PortfolioMilestone() {
  const hydrated = useHydration();
  const balance = usePortfolioStore((s) => s.balance);
  const [milestone, setMilestone] = useState<(typeof MILESTONES)[number] | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    const seen: number[] = JSON.parse(localStorage.getItem(MILESTONE_KEY) || "[]");

    for (const m of MILESTONES) {
      if (balance >= m.amount && !seen.includes(m.amount)) {
        setMilestone(m);
        localStorage.setItem(MILESTONE_KEY, JSON.stringify([...seen, m.amount]));
        const timer = setTimeout(() => setMilestone(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [hydrated, balance]);

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-[85] pointer-events-none flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative animate-scale-in text-center pointer-events-auto" onClick={() => setMilestone(null)}>
        <div className="text-6xl mb-3 animate-bounce-in">{milestone.emoji}</div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
          {milestone.title}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">{milestone.desc}</p>
        <p className="mt-2 text-lg font-black text-profit tabular-nums">
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
