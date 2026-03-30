"use client";

import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface PerformanceBreakdownProps {
  trades: Trade[];
}

interface AssetStats {
  symbol: string;
  trades: number;
  wins: number;
  totalPnl: number;
}

export default function PerformanceBreakdown({ trades }: PerformanceBreakdownProps) {
  if (trades.length < 3) return null;

  // Group by asset
  const byAsset = new Map<string, AssetStats>();
  for (const t of trades) {
    const existing = byAsset.get(t.asset);
    if (existing) {
      existing.trades++;
      if (t.pnl > 0) existing.wins++;
      existing.totalPnl += t.pnl;
    } else {
      byAsset.set(t.asset, {
        symbol: t.asset,
        trades: 1,
        wins: t.pnl > 0 ? 1 : 0,
        totalPnl: t.pnl,
      });
    }
  }

  const sorted = Array.from(byAsset.values())
    .filter((s) => s.trades >= 2)
    .sort((a, b) => b.totalPnl - a.totalPnl);

  if (sorted.length === 0) return null;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Performance by Asset</h2>
      <div className="space-y-2">
        {sorted.map((stat) => {
          const winRate = stat.trades > 0 ? stat.wins / stat.trades : 0;
          return (
            <div
              key={stat.symbol}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{stat.symbol}</span>
                <span className="text-[10px] text-text-muted">
                  {stat.trades} trades · {(winRate * 100).toFixed(0)}% win
                </span>
              </div>
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                stat.totalPnl >= 0 ? "text-profit" : "text-loss",
              )}>
                {stat.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.round(stat.totalPnl * 100) / 100)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
