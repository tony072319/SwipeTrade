"use client";

import { useRef, useCallback } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

export default function ShareCard() {
  const hydrated = useHydration();
  const cardRef = useRef<HTMLDivElement>(null);
  const { balance, totalTrades, winningTrades, totalPnl, bestStreak } = usePortfolioStore();

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const handleShare = useCallback(async () => {
    const text = [
      `SwipeTrade Stats`,
      `Portfolio: ${formatCurrency(balance)}`,
      `P&L: ${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)}`,
      `Win Rate: ${(winRate * 100).toFixed(1)}%`,
      `Trades: ${totalTrades} | Best Streak: ${bestStreak}`,
      ``,
      `Think you can beat me? Try SwipeTrade!`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "My SwipeTrade Stats", text });
      } catch {
        // User cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert("Stats copied to clipboard!");
    }
  }, [balance, totalPnl, winRate, totalTrades, bestStreak]);

  if (!hydrated || totalTrades < 1) return null;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Share Your Stats</h2>

      {/* Preview card */}
      <div
        ref={cardRef}
        className="rounded-2xl border border-border bg-gradient-to-br from-surface-secondary to-surface-primary p-5 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">SwipeTrade</p>
          <p className="mt-2 text-2xl font-black tabular-nums text-text-primary">
            {formatCurrency(balance)}
          </p>
          <p className={cn(
            "text-sm font-semibold tabular-nums",
            totalPnl >= 0 ? "text-profit" : "text-loss",
          )}>
            {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)} all time
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
              <p className={cn(
                "text-sm font-bold",
                winRate >= 0.5 ? "text-profit" : "text-loss",
              )}>
                {(winRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-text-muted">Trades</p>
              <p className="text-sm font-bold text-text-primary">{totalTrades}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-text-muted">Best Streak</p>
              <p className="text-sm font-bold text-text-primary">{bestStreak}W</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
      >
        Share Stats
      </button>
    </div>
  );
}
