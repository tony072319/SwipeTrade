"use client";

import { useState } from "react";
import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface PerformanceBreakdownProps {
  trades: Trade[];
}

interface GroupStats {
  label: string;
  trades: number;
  wins: number;
  totalPnl: number;
  avgPnl: number;
}

type Tab = "asset" | "timeframe" | "direction";

function groupBy(trades: Trade[], key: (t: Trade) => string): GroupStats[] {
  const map = new Map<string, { trades: number; wins: number; totalPnl: number }>();
  for (const t of trades) {
    const k = key(t);
    const existing = map.get(k);
    if (existing) {
      existing.trades++;
      if (t.pnl > 0) existing.wins++;
      existing.totalPnl += t.pnl;
    } else {
      map.set(k, { trades: 1, wins: t.pnl > 0 ? 1 : 0, totalPnl: t.pnl });
    }
  }

  return Array.from(map.entries())
    .map(([label, s]) => ({
      label,
      trades: s.trades,
      wins: s.wins,
      totalPnl: Math.round(s.totalPnl * 100) / 100,
      avgPnl: Math.round((s.totalPnl / s.trades) * 100) / 100,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

export default function PerformanceBreakdown({ trades }: PerformanceBreakdownProps) {
  const [tab, setTab] = useState<Tab>("asset");

  if (trades.length < 3) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "asset", label: "By Asset" },
    { key: "timeframe", label: "By Timeframe" },
    { key: "direction", label: "By Direction" },
  ];

  const grouped = tab === "asset"
    ? groupBy(trades, (t) => t.asset)
    : tab === "timeframe"
      ? groupBy(trades, (t) => t.timeframe)
      : groupBy(trades, (t) => t.direction.toUpperCase());

  // Find best and worst performing groups
  const best = grouped[0];
  const worst = grouped[grouped.length - 1];

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Performance Breakdown</h2>

      {/* Tab pills */}
      <div className="flex gap-1.5 mb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all",
              tab === t.key
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Best/Worst summary */}
      {grouped.length >= 2 && best && worst && best.totalPnl !== worst.totalPnl && (
        <div className="flex gap-2 mb-3">
          <div className="flex-1 rounded-lg bg-profit/5 border border-profit/10 p-2">
            <p className="text-[8px] uppercase text-profit/60">Best</p>
            <p className="text-xs font-bold text-profit">{best.label}</p>
            <p className="text-[10px] text-profit/80 tabular-nums">+{formatCurrency(best.totalPnl)}</p>
          </div>
          {worst.totalPnl < 0 && (
            <div className="flex-1 rounded-lg bg-loss/5 border border-loss/10 p-2">
              <p className="text-[8px] uppercase text-loss/60">Worst</p>
              <p className="text-xs font-bold text-loss">{worst.label}</p>
              <p className="text-[10px] text-loss/80 tabular-nums">{formatCurrency(worst.totalPnl)}</p>
            </div>
          )}
        </div>
      )}

      {/* Breakdown list */}
      <div className="space-y-1.5">
        {grouped.map((stat) => {
          const winRate = stat.trades > 0 ? stat.wins / stat.trades : 0;
          const maxPnl = Math.max(...grouped.map((g) => Math.abs(g.totalPnl)), 1);
          const barWidth = (Math.abs(stat.totalPnl) / maxPnl) * 100;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 overflow-hidden relative"
            >
              {/* Background bar */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 opacity-[0.04]",
                  stat.totalPnl >= 0 ? "bg-profit" : "bg-loss",
                )}
                style={{ width: `${barWidth}%` }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold min-w-[3rem]">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">
                      {stat.trades} trades
                    </span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      winRate >= 0.5 ? "text-profit" : "text-loss",
                    )}>
                      {(winRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-sm font-semibold tabular-nums",
                    stat.totalPnl >= 0 ? "text-profit" : "text-loss",
                  )}>
                    {stat.totalPnl >= 0 ? "+" : ""}{formatCurrency(stat.totalPnl)}
                  </span>
                  <p className={cn(
                    "text-[9px] tabular-nums",
                    stat.avgPnl >= 0 ? "text-profit/60" : "text-loss/60",
                  )}>
                    avg {stat.avgPnl >= 0 ? "+" : ""}{formatCurrency(stat.avgPnl)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
