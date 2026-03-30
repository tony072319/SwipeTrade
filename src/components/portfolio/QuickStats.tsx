"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

export default function QuickStats() {
  const hydrated = useHydration();
  const [open, setOpen] = useState(false);
  const { balance, totalTrades, winningTrades, totalPnl, currentStreak, bestStreak, bestTrade, trades } =
    usePortfolioStore();

  if (!hydrated || totalTrades < 1 || !open) return null;

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
  const longWins = trades.filter((t) => t.direction === "long" && t.pnl > 0).length;
  const shortWins = trades.filter((t) => t.direction === "short" && t.pnl > 0).length;
  const longTotal = trades.filter((t) => t.direction === "long").length;
  const shortTotal = trades.filter((t) => t.direction === "short").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface-secondary p-5 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-bold mb-3">Session Overview</h2>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-tertiary p-2.5">
            <p className="text-[9px] uppercase text-text-muted">Balance</p>
            <p className="text-sm font-bold tabular-nums">{formatCurrency(balance)}</p>
          </div>
          <div className="rounded-lg bg-surface-tertiary p-2.5">
            <p className="text-[9px] uppercase text-text-muted">Total P&L</p>
            <p className={cn("text-sm font-bold tabular-nums", totalPnl >= 0 ? "text-profit" : "text-loss")}>
              {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="rounded-lg bg-surface-tertiary p-2.5">
            <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
            <p className={cn("text-sm font-bold", winRate >= 0.5 ? "text-profit" : "text-loss")}>
              {(winRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-surface-tertiary p-2.5">
            <p className="text-[9px] uppercase text-text-muted">Avg P&L</p>
            <p className={cn("text-sm font-bold tabular-nums", avgPnl >= 0 ? "text-profit" : "text-loss")}>
              {avgPnl >= 0 ? "+" : ""}{formatCurrency(avgPnl)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-between text-xs">
          <div className="text-center">
            <p className="text-text-muted text-[9px]">Long Win</p>
            <p className="font-bold text-profit">{longTotal > 0 ? `${((longWins / longTotal) * 100).toFixed(0)}%` : "-"}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-[9px]">Short Win</p>
            <p className="font-bold text-loss">{shortTotal > 0 ? `${((shortWins / shortTotal) * 100).toFixed(0)}%` : "-"}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-[9px]">Streak</p>
            <p className="font-bold">{currentStreak > 0 ? `${currentStreak}W` : "0"}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-[9px]">Best</p>
            <p className="font-bold text-profit">{bestTrade > 0 ? `+${formatCurrency(bestTrade)}` : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useQuickStats() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((o) => !o) };
}
