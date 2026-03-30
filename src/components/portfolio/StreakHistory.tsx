"use client";

import type { Trade } from "@/types/trade";
import { cn } from "@/lib/utils";

interface StreakHistoryProps {
  trades: Trade[];
}

export default function StreakHistory({ trades }: StreakHistoryProps) {
  if (trades.length < 5) return null;

  // Show last 50 trades as a win/loss strip
  const recent = trades.slice(-50);

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Recent Results</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <div className="flex gap-[2px] flex-wrap">
          {recent.map((trade, i) => (
            <div
              key={i}
              className={cn(
                "h-3 flex-1 min-w-[6px] max-w-[12px] rounded-[1px] transition-colors",
                trade.pnl > 0 ? "bg-profit" : "bg-loss",
              )}
              title={`Trade ${trades.length - recent.length + i + 1}: ${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] text-text-muted">
          <span>Last {recent.length} trades</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-[1px] bg-profit" /> Win
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-[1px] bg-loss" /> Loss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
