"use client";

import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface WeeklySummaryProps {
  trades: Trade[];
}

interface DayStat {
  day: string;
  shortDay: string;
  trades: number;
  wins: number;
  pnl: number;
}

export default function WeeklySummary({ trades }: WeeklySummaryProps) {
  const weekStats = useMemo(() => {
    if (trades.length === 0) return null;

    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days: DayStat[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split("T")[0];
      const shortDay = i === 0 ? "Today" : i === 1 ? "Yesterday" : dayNames[date.getDay()];

      const dayTrades = trades.filter((t) => t.createdAt.startsWith(dayStr));
      const wins = dayTrades.filter((t) => t.pnl > 0).length;
      const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);

      days.push({ day: dayStr, shortDay, trades: dayTrades.length, wins, pnl: Math.round(pnl * 100) / 100 });
    }

    const totalTrades = days.reduce((s, d) => s + d.trades, 0);
    const totalPnl = Math.round(days.reduce((s, d) => s + d.pnl, 0) * 100) / 100;
    const totalWins = days.reduce((s, d) => s + d.wins, 0);
    const maxPnl = Math.max(...days.map((d) => Math.abs(d.pnl)), 1);

    return { days, totalTrades, totalPnl, totalWins, maxPnl };
  }, [trades]);

  if (!weekStats || weekStats.totalTrades === 0) return null;

  const winRate = weekStats.totalTrades > 0 ? weekStats.totalWins / weekStats.totalTrades : 0;

  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary">This Week</h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted">{weekStats.totalTrades} trades</span>
          <span className={cn(
            "text-[10px] font-bold",
            weekStats.totalPnl >= 0 ? "text-profit" : "text-loss",
          )}>
            {weekStats.totalPnl >= 0 ? "+" : ""}{formatCurrency(weekStats.totalPnl)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-secondary p-4">
        {/* Bar chart */}
        <div className="flex items-end justify-between gap-1 h-20 mb-2">
          {weekStats.days.map((day) => {
            const height = day.pnl === 0 ? 2 : Math.max(4, (Math.abs(day.pnl) / weekStats.maxPnl) * 100);
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                  <div
                    className={cn(
                      "w-full max-w-[1.2rem] rounded-t-sm transition-all",
                      day.pnl > 0 ? "bg-profit" : day.pnl < 0 ? "bg-loss" : "bg-border",
                    )}
                    style={{ height: `${height}%`, minHeight: "2px" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex justify-between gap-1">
          {weekStats.days.map((day) => (
            <div key={day.day} className="flex-1 text-center">
              <p className="text-[8px] text-text-muted">{day.shortDay}</p>
              {day.trades > 0 && (
                <p className={cn(
                  "text-[8px] font-bold tabular-nums",
                  day.pnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {day.pnl >= 0 ? "+" : ""}{day.pnl >= 1000 || day.pnl <= -1000
                    ? `$${(day.pnl / 1000).toFixed(1)}k`
                    : `$${Math.round(day.pnl)}`}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="mt-3 pt-2 border-t border-border flex justify-between text-[10px]">
          <span className="text-text-muted">
            Win Rate: <span className={cn("font-bold", winRate >= 0.5 ? "text-profit" : "text-loss")}>
              {(winRate * 100).toFixed(0)}%
            </span>
          </span>
          <span className="text-text-muted">
            Avg: <span className={cn(
              "font-bold",
              weekStats.totalPnl / weekStats.totalTrades >= 0 ? "text-profit" : "text-loss",
            )}>
              {weekStats.totalPnl / weekStats.totalTrades >= 0 ? "+" : ""}
              {formatCurrency(weekStats.totalPnl / weekStats.totalTrades)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
