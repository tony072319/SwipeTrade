"use client";

import { useMemo } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { formatCurrency, cn } from "@/lib/utils";
import { TIMEFRAME_LABELS } from "@/lib/data/assets";

export default function TimeframeBreakdown() {
  const trades = usePortfolioStore((s) => s.trades);

  const { byTimeframe, byDirection } = useMemo(() => {
    const tf: Record<string, { trades: number; wins: number; pnl: number }> = {};
    const dir: Record<string, { trades: number; wins: number; pnl: number }> = {
      long: { trades: 0, wins: 0, pnl: 0 },
      short: { trades: 0, wins: 0, pnl: 0 },
    };

    for (const t of trades) {
      // By timeframe
      const label = TIMEFRAME_LABELS[t.timeframe as keyof typeof TIMEFRAME_LABELS] ?? t.timeframe;
      if (!tf[label]) tf[label] = { trades: 0, wins: 0, pnl: 0 };
      tf[label].trades++;
      if (t.pnl > 0) tf[label].wins++;
      tf[label].pnl += t.pnl;

      // By direction
      dir[t.direction].trades++;
      if (t.pnl > 0) dir[t.direction].wins++;
      dir[t.direction].pnl += t.pnl;
    }

    return {
      byTimeframe: Object.entries(tf).sort(([, a], [, b]) => b.trades - a.trades),
      byDirection: Object.entries(dir),
    };
  }, [trades]);

  if (trades.length < 3) return null;

  return (
    <div className="mt-6">
      <h2 className="px-4 text-sm font-semibold text-text-primary mb-2">Trading Patterns</h2>

      {/* Direction breakdown */}
      <div className="mx-4 grid grid-cols-2 gap-2 mb-3">
        {byDirection.map(([dir, stats]) => {
          const wr = stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0;
          return (
            <div key={dir} className={cn(
              "rounded-xl border p-3",
              dir === "long" ? "border-profit/20 bg-profit/5" : "border-loss/20 bg-loss/5",
            )}>
              <p className={cn(
                "text-xs font-black uppercase",
                dir === "long" ? "text-profit" : "text-loss",
              )}>
                {dir}
              </p>
              <p className={cn(
                "text-sm font-bold tabular-nums",
                stats.pnl >= 0 ? "text-profit" : "text-loss",
              )}>
                {stats.pnl >= 0 ? "+" : ""}{formatCurrency(Math.round(stats.pnl * 100) / 100)}
              </p>
              <p className="text-[9px] text-text-muted">
                {stats.trades} trades | {wr}% win
              </p>
            </div>
          );
        })}
      </div>

      {/* Timeframe breakdown */}
      {byTimeframe.length > 1 && (
        <div className="mx-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase text-text-muted">By Timeframe</p>
          {byTimeframe.map(([tf, stats]) => {
            const wr = stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0;
            return (
              <div key={tf} className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{tf}</span>
                  <span className="text-[9px] text-text-muted">{stats.trades} trades</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-text-muted">{wr}%</span>
                  <span className={cn(
                    "text-xs font-bold tabular-nums",
                    stats.pnl >= 0 ? "text-profit" : "text-loss",
                  )}>
                    {stats.pnl >= 0 ? "+" : ""}{formatCurrency(Math.round(stats.pnl * 100) / 100)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
