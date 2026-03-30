"use client";

import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import { cn } from "@/lib/utils";

interface TradingHoursProps {
  trades: Trade[];
}

const HOUR_LABELS = ["12a", "", "", "3a", "", "", "6a", "", "", "9a", "", "", "12p", "", "", "3p", "", "", "6p", "", "", "9p", "", ""];

export default function TradingHours({ trades }: TradingHoursProps) {
  const hourData = useMemo(() => {
    if (trades.length < 10) return null;

    const hours = Array.from({ length: 24 }, () => ({ count: 0, wins: 0, pnl: 0 }));

    for (const trade of trades) {
      const hour = new Date(trade.id).getHours();
      hours[hour].count += 1;
      if (trade.pnl > 0) hours[hour].wins += 1;
      hours[hour].pnl += trade.pnl;
    }

    const maxCount = Math.max(...hours.map((h) => h.count), 1);

    // Find best and worst hours
    const activeHours = hours
      .map((h, i) => ({ ...h, hour: i }))
      .filter((h) => h.count >= 2);

    const bestHour = activeHours.length > 0
      ? activeHours.reduce((best, h) => (h.wins / h.count > best.wins / best.count ? h : best))
      : null;

    const worstHour = activeHours.length > 0
      ? activeHours.reduce((worst, h) => (h.wins / h.count < worst.wins / worst.count ? h : worst))
      : null;

    return { hours, maxCount, bestHour, worstHour };
  }, [trades]);

  if (!hourData) return null;

  const { hours, maxCount, bestHour, worstHour } = hourData;

  const formatHour = (h: number) => {
    if (h === 0) return "12am";
    if (h < 12) return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Trading Hours</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        {/* Hour bars */}
        <div className="flex items-end gap-[2px] h-16">
          {hours.map((h, i) => {
            const height = h.count > 0 ? Math.max((h.count / maxCount) * 100, 8) : 0;
            const winRate = h.count > 0 ? h.wins / h.count : 0;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-[1px] transition-colors",
                  h.count === 0 && "bg-surface-tertiary",
                  h.count > 0 && winRate >= 0.5 && "bg-profit",
                  h.count > 0 && winRate < 0.5 && "bg-loss",
                )}
                style={{ height: h.count > 0 ? `${height}%` : "2px" }}
                title={`${formatHour(i)}: ${h.count} trades, ${(winRate * 100).toFixed(0)}% win`}
              />
            );
          })}
        </div>
        {/* Hour labels */}
        <div className="flex mt-1">
          {HOUR_LABELS.map((label, i) => (
            <div key={i} className="flex-1 text-center text-[7px] text-text-muted">
              {label}
            </div>
          ))}
        </div>

        {/* Best/worst hour */}
        {(bestHour || worstHour) && (
          <div className="mt-2 flex gap-2">
            {bestHour && bestHour.count >= 2 && (
              <div className="flex-1 rounded-lg bg-profit/5 px-2 py-1.5 border border-profit/10">
                <p className="text-[8px] uppercase text-text-muted">Best Hour</p>
                <p className="text-xs font-bold text-profit">
                  {formatHour(bestHour.hour)} ({(bestHour.wins / bestHour.count * 100).toFixed(0)}% win)
                </p>
              </div>
            )}
            {worstHour && worstHour.count >= 2 && (
              <div className="flex-1 rounded-lg bg-loss/5 px-2 py-1.5 border border-loss/10">
                <p className="text-[8px] uppercase text-text-muted">Worst Hour</p>
                <p className="text-xs font-bold text-loss">
                  {formatHour(worstHour.hour)} ({(worstHour.wins / worstHour.count * 100).toFixed(0)}% win)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
