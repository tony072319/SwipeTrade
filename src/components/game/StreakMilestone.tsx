"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreakMilestoneProps {
  streak: number;
  previousStreak: number;
}

const MILESTONES: Record<number, { title: string; subtitle: string; emoji: string; color: string }> = {
  3: { title: "Hat Trick!", subtitle: "3 wins in a row", emoji: "\uD83C\uDFA9", color: "from-blue-500 to-cyan-400" },
  5: { title: "On Fire!", subtitle: "5 consecutive wins", emoji: "\uD83D\uDD25", color: "from-orange-500 to-yellow-400" },
  7: { title: "Lucky Seven!", subtitle: "7 straight wins", emoji: "\u2B50", color: "from-yellow-500 to-amber-300" },
  10: { title: "Domination!", subtitle: "10 wins without a loss", emoji: "\uD83D\uDC51", color: "from-purple-500 to-pink-400" },
  15: { title: "Legendary!", subtitle: "15 win streak — incredible!", emoji: "\uD83C\uDFC6", color: "from-amber-400 to-yellow-200" },
  20: { title: "GOAT Status!", subtitle: "20 wins — you can't be stopped", emoji: "\uD83D\uDC10", color: "from-emerald-400 to-teal-300" },
  25: { title: "Mythical!", subtitle: "25 consecutive victories", emoji: "\uD83D\uDD31", color: "from-violet-500 to-purple-300" },
};

export default function StreakMilestone({ streak, previousStreak }: StreakMilestoneProps) {
  const [show, setShow] = useState(false);
  const [milestone, setMilestone] = useState<(typeof MILESTONES)[number] | null>(null);

  useEffect(() => {
    // Check if we just crossed a milestone threshold
    const milestoneKeys = Object.keys(MILESTONES).map(Number).sort((a, b) => a - b);
    for (const key of milestoneKeys) {
      if (streak >= key && previousStreak < key) {
        setMilestone(MILESTONES[key]);
        setShow(true);
        const timer = setTimeout(() => setShow(false), 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [streak, previousStreak]);

  if (!show || !milestone) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center">
      {/* Radial burst background */}
      <div className="absolute inset-0 animate-fade-in">
        <div className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl bg-gradient-to-br",
          milestone.color,
        )} />
      </div>

      {/* Milestone card */}
      <div className="animate-scale-in pointer-events-auto">
        <div className="text-center">
          <div className="text-6xl animate-bounce-in mb-3">{milestone.emoji}</div>
          <h2 className={cn(
            "text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent",
            milestone.color,
          )}>
            {milestone.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {milestone.subtitle}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-secondary/80 px-3 py-1 backdrop-blur-sm">
            <span className="text-xs font-bold text-accent tabular-nums">{streak}</span>
            <span className="text-[10px] text-text-muted">win streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
