"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PortfolioBarProps {
  balance: number;
  totalPnl: number;
  winRate: number;
  flash?: "profit" | "loss" | null;
}

export default function PortfolioBar({
  balance,
  totalPnl,
  winRate,
  flash,
}: PortfolioBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h1 className="text-lg font-bold">SwipeTrade</h1>
      <div className="flex items-center gap-4">
        {/* Win rate */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-text-muted">Win Rate</span>
          <span className="text-xs font-semibold text-text-secondary tabular-nums">
            {(winRate * 100).toFixed(0)}%
          </span>
        </div>

        {/* Total P&L */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-text-muted">P&L</span>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              totalPnl >= 0 ? "text-profit" : "text-loss",
            )}
          >
            {totalPnl >= 0 ? "+" : ""}
            {formatCurrency(totalPnl)}
          </span>
        </div>

        {/* Balance */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-text-muted">Balance</span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums transition-colors duration-300",
              flash === "profit" && "text-profit",
              flash === "loss" && "text-loss",
              !flash && "text-text-primary",
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
