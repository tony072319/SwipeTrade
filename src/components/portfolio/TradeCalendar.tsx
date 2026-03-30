"use client";

import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import { cn } from "@/lib/utils";

interface TradeCalendarProps {
  trades: Trade[];
}

export default function TradeCalendar({ trades }: TradeCalendarProps) {
  const calendarData = useMemo(() => {
    if (trades.length === 0) return null;

    const today = new Date();
    const weeks = 12; // Show last 12 weeks
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);
    startDate.setHours(0, 0, 0, 0);

    // Build day map
    const dayMap = new Map<string, { count: number; pnl: number }>();
    for (const trade of trades) {
      const d = new Date(trade.id); // trade.id is timestamp-based
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = dayMap.get(key) || { count: 0, pnl: 0 };
      existing.count += 1;
      existing.pnl += trade.pnl;
      dayMap.set(key, existing);
    }

    // Build grid
    const grid: { date: Date; count: number; pnl: number }[][] = [];
    let currentWeek: { date: Date; count: number; pnl: number }[] = [];

    // Pad first week
    const dayOfWeek = startDate.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), count: -1, pnl: 0 }); // placeholder
    }

    const d = new Date(startDate);
    while (d <= today) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const data = dayMap.get(key) || { count: 0, pnl: 0 };
      currentWeek.push({ date: new Date(d), count: data.count, pnl: data.pnl });

      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }

      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      grid.push(currentWeek);
    }

    // Find max count for intensity scaling
    let maxCount = 1;
    for (const [, v] of dayMap) {
      if (v.count > maxCount) maxCount = v.count;
    }

    return { grid, maxCount };
  }, [trades]);

  if (!calendarData || trades.length === 0) return null;

  const { grid, maxCount } = calendarData;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Activity</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <div className="flex gap-[3px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1">
              {week.map((day, di) => {
                if (day.count === -1) {
                  return <div key={di} className="aspect-square rounded-[2px]" />;
                }
                const intensity = day.count === 0 ? 0 : Math.ceil((day.count / maxCount) * 4);
                const isProfit = day.pnl >= 0;
                return (
                  <div
                    key={di}
                    className={cn(
                      "aspect-square rounded-[2px] transition-colors",
                      intensity === 0 && "bg-surface-tertiary",
                      intensity === 1 && (isProfit ? "bg-profit/20" : "bg-loss/20"),
                      intensity === 2 && (isProfit ? "bg-profit/40" : "bg-loss/40"),
                      intensity === 3 && (isProfit ? "bg-profit/60" : "bg-loss/60"),
                      intensity >= 4 && (isProfit ? "bg-profit/80" : "bg-loss/80"),
                    )}
                    title={`${day.date.toLocaleDateString()}: ${day.count} trades, $${day.pnl.toFixed(0)} P&L`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] text-text-muted">Last 12 weeks</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-text-muted mr-1">Less</span>
            <div className="h-2 w-2 rounded-[2px] bg-surface-tertiary" />
            <div className="h-2 w-2 rounded-[2px] bg-profit/20" />
            <div className="h-2 w-2 rounded-[2px] bg-profit/40" />
            <div className="h-2 w-2 rounded-[2px] bg-profit/60" />
            <div className="h-2 w-2 rounded-[2px] bg-profit/80" />
            <span className="text-[9px] text-text-muted ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
