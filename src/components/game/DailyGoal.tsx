"use client";

import { useMemo } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

const DAILY_GOALS = [
  { trades: 5, label: "Warm Up" },
  { trades: 15, label: "Active Trader" },
  { trades: 30, label: "Power Session" },
];

export default function DailyGoal() {
  const hydrated = useHydration();
  const trades = usePortfolioStore((s) => s.trades);

  const todayStats = useMemo(() => {
    if (!hydrated) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const todayTrades = trades.filter((t) => {
      const tradeDate = new Date(t.id);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === todayTs;
    });

    if (todayTrades.length === 0) return null;

    const pnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = todayTrades.filter((t) => t.pnl > 0).length;

    // Find current goal tier
    const currentGoal = [...DAILY_GOALS].reverse().find((g) => todayTrades.length >= g.trades);
    const nextGoal = DAILY_GOALS.find((g) => todayTrades.length < g.trades);

    return {
      count: todayTrades.length,
      pnl,
      wins,
      winRate: wins / todayTrades.length,
      currentGoal,
      nextGoal,
    };
  }, [hydrated, trades]);

  if (!todayStats || todayStats.count < 3) return null;

  const { count, pnl, winRate, currentGoal, nextGoal } = todayStats;

  return (
    <div className="mx-3 mb-1">
      <div className="rounded-lg bg-surface-secondary/50 border border-border px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase text-text-muted">Today</span>
          <span className="text-xs font-bold tabular-nums">{count} trades</span>
          <span className={cn(
            "text-[10px] font-semibold tabular-nums",
            pnl >= 0 ? "text-profit" : "text-loss",
          )}>
            {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[9px] font-bold tabular-nums",
            winRate >= 0.5 ? "text-profit" : "text-loss",
          )}>
            {(winRate * 100).toFixed(0)}%
          </span>
          {nextGoal && (
            <div className="flex items-center gap-1">
              <div className="h-1 w-8 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min((count / nextGoal.trades) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[8px] text-text-muted">{nextGoal.trades - count} to go</span>
            </div>
          )}
          {currentGoal && !nextGoal && (
            <span className="text-[8px] font-bold text-accent">{currentGoal.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
