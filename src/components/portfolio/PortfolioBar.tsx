"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PortfolioBarProps {
  balance: number;
  totalPnl: number;
  winRate: number;
  streak?: number;
  flash?: "profit" | "loss" | null;
  onBalanceTap?: () => void;
}

export default function PortfolioBar({
  balance,
  totalPnl,
  winRate,
  streak = 0,
  flash,
  onBalanceTap,
}: PortfolioBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-secondary/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
          SwipeTrade
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Streak */}
        {streak >= 2 && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-text-muted">Streak</span>
            <span className="text-xs font-bold tabular-nums text-profit">
              {streak >= 3 ? "\uD83D\uDD25" : ""}{streak}
            </span>
          </div>
        )}

        {/* Win rate */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Win</span>
          <span className="text-xs font-bold text-text-secondary tabular-nums">
            {(winRate * 100).toFixed(0)}%
          </span>
        </div>

        {/* Total P&L */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">P&L</span>
          <span
            className={cn(
              "text-xs font-bold tabular-nums",
              totalPnl >= 0 ? "text-profit" : "text-loss",
            )}
          >
            {totalPnl >= 0 ? "+" : ""}
            {formatCurrency(totalPnl)}
          </span>
        </div>

        {/* Balance - tappable */}
        <button
          onClick={onBalanceTap}
          className="flex flex-col items-end"
        >
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Balance</span>
          <span
            className={cn(
              "text-sm font-black tabular-nums transition-all duration-300",
              flash === "profit" && "text-profit scale-105",
              flash === "loss" && "text-loss scale-105",
              !flash && "text-text-primary",
            )}
          >
            {formatCurrency(balance)}
          </span>
        </button>
      </div>
    </div>
  );
}
