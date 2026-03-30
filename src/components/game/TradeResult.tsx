"use client";

import { useEffect, useState } from "react";
import type { TradeResult as TradeResultType } from "@/types/trade";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

interface TradeResultProps {
  result: TradeResultType;
  balance: number;
  onNext: () => void;
}

export default function TradeResult({
  result,
  balance,
  onNext,
}: TradeResultProps) {
  const [animatedPnl, setAnimatedPnl] = useState(0);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Count-up animation for P&L
  useEffect(() => {
    const duration = 600;
    const steps = 30;
    const increment = result.pnl / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setAnimatedPnl(result.pnl);
        clearInterval(interval);
      } else {
        setAnimatedPnl(current);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [result.pnl]);

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex items-center justify-center bg-surface/80 backdrop-blur-sm transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        {/* Direction badge */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={cn(
              "rounded-lg px-3 py-1 text-sm font-bold uppercase",
              result.direction === "long"
                ? "bg-profit-bg text-profit"
                : "bg-loss-bg text-loss",
            )}
          >
            {result.direction}
          </span>
          <span className="rounded-lg bg-surface-secondary px-3 py-1 text-sm font-semibold text-text-secondary">
            {result.leverage}x
          </span>
        </div>

        {/* P&L display */}
        <div className="mb-4 text-center">
          <p
            className={cn(
              "text-4xl font-black tabular-nums",
              result.isWin ? "text-profit" : "text-loss",
            )}
          >
            {result.pnl >= 0 ? "+" : ""}
            {formatCurrency(animatedPnl)}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-medium",
              result.isWin ? "text-profit/70" : "text-loss/70",
            )}
          >
            {formatPercent(result.pnlPercent)}
          </p>
        </div>

        {/* Trade details */}
        <div className="mb-5 space-y-2 rounded-xl bg-surface-secondary p-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Entry</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrency(result.entryPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Exit</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrency(result.exitPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Bet</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrency(result.betAmount)}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-text-muted">Balance</span>
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full rounded-xl bg-text-primary py-3 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active:opacity-80"
        >
          Next Trade
        </button>
      </div>
    </div>
  );
}
