"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

interface SessionData {
  startBalance: number;
  startTrades: number;
  startWins: number;
  startPnl: number;
  timestamp: number;
}

const SESSION_KEY = "swipetrade-session";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function SessionSummary() {
  const hydrated = useHydration();
  const { balance, totalTrades, winningTrades, totalPnl } = usePortfolioStore();
  const [summary, setSummary] = useState<{
    trades: number;
    wins: number;
    pnl: number;
    startBalance: number;
  } | null>(null);

  useEffect(() => {
    if (!hydrated || totalTrades < 1) return;

    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const session: SessionData = JSON.parse(stored);
        const elapsed = Date.now() - session.timestamp;

        if (elapsed > SESSION_TIMEOUT) {
          // Session expired — show summary of previous session
          const sessionTrades = totalTrades - session.startTrades;
          const sessionWins = winningTrades - session.startWins;
          const sessionPnl = Math.round((totalPnl - session.startPnl) * 100) / 100;

          if (sessionTrades > 0) {
            setSummary({
              trades: sessionTrades,
              wins: sessionWins,
              pnl: sessionPnl,
              startBalance: session.startBalance,
            });
          }

          // Start new session
          saveSession();
        }
        // else: session still active, just update timestamp
        else {
          const updated: SessionData = { ...session, timestamp: Date.now() };
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        }
      } catch {
        saveSession();
      }
    } else {
      saveSession();
    }

    function saveSession() {
      const session: SessionData = {
        startBalance: balance,
        startTrades: totalTrades,
        startWins: winningTrades,
        startPnl: totalPnl,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }, [hydrated, balance, totalTrades, winningTrades, totalPnl]);

  if (!summary) return null;

  const winRate = summary.trades > 0 ? summary.wins / summary.trades : 0;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in"
      onClick={() => setSummary(null)}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-accent/20 bg-surface-secondary p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Welcome Back</p>
          <h2 className="text-lg font-black mt-1">Last Session Recap</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-tertiary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Trades</p>
            <p className="text-xl font-black tabular-nums">{summary.trades}</p>
          </div>
          <div className="rounded-lg bg-surface-tertiary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
            <p className={cn("text-xl font-black", winRate >= 0.5 ? "text-profit" : "text-loss")}>
              {(winRate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-surface-tertiary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Session P&L</p>
            <p className={cn("text-2xl font-black tabular-nums", summary.pnl >= 0 ? "text-profit" : "text-loss")}>
              {summary.pnl >= 0 ? "+" : ""}{formatCurrency(summary.pnl)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSummary(null)}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Start Trading
        </button>
      </div>
    </div>
  );
}
