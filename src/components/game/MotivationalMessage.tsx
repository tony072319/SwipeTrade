"use client";

import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { STARTING_BALANCE } from "@/lib/game/constants";
import { cn } from "@/lib/utils";

const MESSAGES = {
  newPlayer: [
    "Your first trades shape your strategy. Stay curious!",
    "Everyone starts somewhere. Focus on learning, not earning.",
    "The market rewards patience. Take your time.",
  ],
  winning: [
    "You're reading the charts well. Keep it up!",
    "Consistency beats luck. Stay disciplined.",
    "Profit is a byproduct of good decisions.",
  ],
  losing: [
    "Every loss is a lesson. What did the chart tell you?",
    "The best traders bounce back. Reset and refocus.",
    "Consider reducing bet size until you find your rhythm.",
  ],
  streak: [
    "Hot streak! Don't let confidence become overconfidence.",
    "You're on fire! Stay focused on the process.",
    "Momentum is powerful. Ride it wisely.",
  ],
  bankrupt: [
    "Low balance is a sign to reassess your strategy.",
    "Consider resetting. Fresh starts build stronger habits.",
  ],
  wealthy: [
    "Impressive portfolio! Your skills are showing.",
    "You've doubled your starting capital. Legendary!",
  ],
};

function pickMessage(arr: string[]): string {
  // Use time-based index for variety within sessions
  const idx = Math.floor(Date.now() / 60000) % arr.length;
  return arr[idx];
}

export default function MotivationalMessage() {
  const hydrated = useHydration();
  const { balance, totalTrades, winningTrades, currentStreak, totalPnl } = usePortfolioStore();

  if (!hydrated || totalTrades < 1) return null;

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  let message: string;
  let color: "profit" | "loss" | "accent" | "muted" = "muted";

  if (balance < 500) {
    message = pickMessage(MESSAGES.bankrupt);
    color = "loss";
  } else if (balance > STARTING_BALANCE * 2) {
    message = pickMessage(MESSAGES.wealthy);
    color = "profit";
  } else if (currentStreak >= 3) {
    message = pickMessage(MESSAGES.streak);
    color = "accent";
  } else if (totalTrades <= 5) {
    message = pickMessage(MESSAGES.newPlayer);
    color = "muted";
  } else if (winRate >= 0.55) {
    message = pickMessage(MESSAGES.winning);
    color = "profit";
  } else {
    message = pickMessage(MESSAGES.losing);
    color = "loss";
  }

  return (
    <div className={cn(
      "px-4 py-2 text-center text-[10px] font-medium border-b",
      color === "profit" && "text-profit/70 bg-profit/5 border-profit/10",
      color === "loss" && "text-loss/70 bg-loss/5 border-loss/10",
      color === "accent" && "text-accent/70 bg-accent/5 border-accent/10",
      color === "muted" && "text-text-muted bg-surface-secondary/30 border-border",
    )}>
      {message}
    </div>
  );
}
