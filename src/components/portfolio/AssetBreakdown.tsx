"use client";

import { useMemo } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function AssetBreakdown() {
  const trades = usePortfolioStore((s) => s.trades);

  const breakdown = useMemo(() => {
    const byType: Record<string, { trades: number; wins: number; pnl: number }> = {};
    const byAsset: Record<string, { trades: number; wins: number; pnl: number }> = {};

    for (const t of trades) {
      // By type
      const type = t.assetType === "crypto" ? "Crypto" : "Stocks";
      if (!byType[type]) byType[type] = { trades: 0, wins: 0, pnl: 0 };
      byType[type].trades++;
      if (t.pnl > 0) byType[type].wins++;
      byType[type].pnl += t.pnl;

      // By asset (top traded)
      if (!byAsset[t.asset]) byAsset[t.asset] = { trades: 0, wins: 0, pnl: 0 };
      byAsset[t.asset].trades++;
      if (t.pnl > 0) byAsset[t.asset].wins++;
      byAsset[t.asset].pnl += t.pnl;
    }

    // Top 5 most traded assets
    const topAssets = Object.entries(byAsset)
      .sort(([, a], [, b]) => b.trades - a.trades)
      .slice(0, 5);

    // Best and worst performing assets (min 2 trades)
    const qualified = Object.entries(byAsset).filter(([, v]) => v.trades >= 2);
    const bestAsset = qualified.sort(([, a], [, b]) => b.pnl - a.pnl)[0];
    const worstAsset = qualified.sort(([, a], [, b]) => a.pnl - b.pnl)[0];

    return { byType: Object.entries(byType), topAssets, bestAsset, worstAsset };
  }, [trades]);

  if (trades.length < 3) return null;

  return (
    <div className="mt-6">
      <h2 className="px-4 text-sm font-semibold text-text-primary mb-2">Asset Breakdown</h2>

      {/* By type */}
      <div className="mx-4 grid grid-cols-2 gap-2 mb-3">
        {breakdown.byType.map(([type, stats]) => (
          <div key={type} className="rounded-xl border border-border bg-surface-secondary p-3">
            <p className="text-[10px] font-bold uppercase text-text-muted">{type}</p>
            <p className={cn(
              "text-sm font-black tabular-nums",
              stats.pnl >= 0 ? "text-profit" : "text-loss",
            )}>
              {stats.pnl >= 0 ? "+" : ""}{formatCurrency(Math.round(stats.pnl * 100) / 100)}
            </p>
            <p className="text-[9px] text-text-muted">
              {stats.trades} trades | {stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0}% win
            </p>
          </div>
        ))}
      </div>

      {/* Top traded assets */}
      {breakdown.topAssets.length > 0 && (
        <div className="mx-4 space-y-1.5 mb-3">
          <p className="text-[10px] font-bold uppercase text-text-muted">Most Traded</p>
          {breakdown.topAssets.map(([symbol, stats]) => (
            <div key={symbol} className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{symbol}</span>
                <span className="text-[9px] text-text-muted">{stats.trades} trades</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted">
                  {stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0}%
                </span>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  stats.pnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {stats.pnl >= 0 ? "+" : ""}{formatCurrency(Math.round(stats.pnl * 100) / 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Best/Worst asset */}
      {(breakdown.bestAsset || breakdown.worstAsset) && (
        <div className="mx-4 grid grid-cols-2 gap-2">
          {breakdown.bestAsset && (
            <div className="rounded-xl border border-profit/20 bg-profit/5 p-3">
              <p className="text-[9px] font-bold uppercase text-text-muted">Best Asset</p>
              <p className="text-sm font-black text-profit">{breakdown.bestAsset[0]}</p>
              <p className="text-[9px] text-profit/70">
                +{formatCurrency(Math.round(breakdown.bestAsset[1].pnl * 100) / 100)}
              </p>
            </div>
          )}
          {breakdown.worstAsset && (
            <div className="rounded-xl border border-loss/20 bg-loss/5 p-3">
              <p className="text-[9px] font-bold uppercase text-text-muted">Worst Asset</p>
              <p className="text-sm font-black text-loss">{breakdown.worstAsset[0]}</p>
              <p className="text-[9px] text-loss/70">
                {formatCurrency(Math.round(breakdown.worstAsset[1].pnl * 100) / 100)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
