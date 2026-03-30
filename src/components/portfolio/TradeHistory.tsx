"use client";

import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-text-muted">No trades yet</p>
        <p className="mt-1 text-xs text-text-muted">
          Start trading to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            {/* Direction badge */}
            <span
              className={cn(
                "w-14 rounded-md py-0.5 text-center text-[10px] font-bold uppercase",
                trade.direction === "long"
                  ? "bg-profit-bg text-profit"
                  : "bg-loss-bg text-loss",
              )}
            >
              {trade.direction}
            </span>

            {/* Asset info */}
            <div>
              <p className="text-sm font-medium text-text-primary">
                {trade.asset}
                <span className="ml-1.5 text-xs text-text-muted">
                  {trade.leverage}x
                </span>
              </p>
              <p className="text-[10px] text-text-muted">
                {trade.timeframe} &middot;{" "}
                {new Date(trade.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* P&L */}
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              trade.pnl >= 0 ? "text-profit" : "text-loss",
            )}
          >
            {trade.pnl >= 0 ? "+" : ""}
            {formatCurrency(trade.pnl)}
          </span>
        </div>
      ))}
    </div>
  );
}
