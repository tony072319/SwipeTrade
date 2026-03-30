"use client";

import { useEffect, useState, useCallback } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

const RECAP_INTERVAL = 10; // Show every 10 trades
const RECAP_KEY = "swipetrade-last-recap-count";

export default function MiniRecap() {
  const hydrated = useHydration();
  const totalTrades = usePortfolioStore((s) => s.totalTrades);
  const trades = usePortfolioStore((s) => s.trades);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hydrated || totalTrades < RECAP_INTERVAL) return;

    const lastCount = parseInt(localStorage.getItem(RECAP_KEY) || "0", 10);
    const nextMilestone = Math.floor(totalTrades / RECAP_INTERVAL) * RECAP_INTERVAL;

    if (nextMilestone > lastCount && nextMilestone === totalTrades) {
      setShow(true);
      localStorage.setItem(RECAP_KEY, String(nextMilestone));
    }
  }, [hydrated, totalTrades]);

  const dismiss = useCallback(() => setShow(false), []);

  if (!show || trades.length < RECAP_INTERVAL) return null;

  const last10 = trades.slice(-RECAP_INTERVAL);
  const pnl = last10.reduce((sum, t) => sum + t.pnl, 0);
  const wins = last10.filter((t) => t.pnl > 0).length;
  const winRate = wins / last10.length;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none flex items-end justify-center pb-20 animate-fade-in">
      <div
        className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl border border-accent/20 bg-surface-secondary p-4 shadow-2xl animate-slide-up"
        onClick={dismiss}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
            {totalTrades} Trade Recap
          </p>
          <span className="text-[10px] text-text-muted">Tap to dismiss</span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] uppercase text-text-muted">Last {RECAP_INTERVAL} P&L</p>
            <p className={cn(
              "text-lg font-black tabular-nums",
              pnl >= 0 ? "text-profit" : "text-loss",
            )}>
              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
            <p className={cn(
              "text-lg font-black tabular-nums",
              winRate >= 0.5 ? "text-profit" : "text-loss",
            )}>
              {(winRate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="flex-1 flex gap-0.5 items-end justify-end">
            {last10.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 rounded-t-[1px]",
                  t.pnl >= 0 ? "bg-profit" : "bg-loss",
                )}
                style={{ height: `${Math.min(Math.max(Math.abs(t.pnl) / 10, 4), 32)}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
