"use client";

import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface BestWorstDayProps {
  trades: Trade[];
}

export default function BestWorstDay({ trades }: BestWorstDayProps) {
  const data = useMemo(() => {
    if (trades.length < 5) return null;

    // Group trades by date
    const dayMap = new Map<string, { pnl: number; count: number; wins: number }>();
    for (const trade of trades) {
      const d = new Date(trade.id);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = dayMap.get(key) || { pnl: 0, count: 0, wins: 0 };
      existing.pnl += trade.pnl;
      existing.count += 1;
      if (trade.pnl > 0) existing.wins += 1;
      dayMap.set(key, existing);
    }

    if (dayMap.size < 2) return null;

    const days = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    const best = days.reduce((b, d) => (d.pnl > b.pnl ? d : b));
    const worst = days.reduce((w, d) => (d.pnl < w.pnl ? d : w));

    return { best, worst, totalDays: days.length };
  }, [trades]);

  if (!data) return null;

  const { best, worst, totalDays } = data;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Best & Worst Days</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-profit/10 bg-profit/5 p-3">
          <p className="text-[8px] uppercase text-text-muted">Best Day</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{best.date}</p>
          <p className="text-lg font-black text-profit tabular-nums">
            +{formatCurrency(best.pnl)}
          </p>
          <p className="text-[9px] text-text-muted mt-0.5">
            {best.count} trades, {best.wins} wins
          </p>
        </div>
        <div className="rounded-xl border border-loss/10 bg-loss/5 p-3">
          <p className="text-[8px] uppercase text-text-muted">Worst Day</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{worst.date}</p>
          <p className={cn(
            "text-lg font-black tabular-nums",
            worst.pnl >= 0 ? "text-profit" : "text-loss",
          )}>
            {worst.pnl >= 0 ? "+" : ""}{formatCurrency(worst.pnl)}
          </p>
          <p className="text-[9px] text-text-muted mt-0.5">
            {worst.count} trades, {worst.wins} wins
          </p>
        </div>
      </div>
      <p className="text-[9px] text-text-muted mt-1 text-center">
        Across {totalDays} trading days
      </p>
    </div>
  );
}
