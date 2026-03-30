"use client";

import { useState, useMemo } from "react";
import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface TradeHistoryProps {
  trades: Trade[];
}

type Filter = "all" | "wins" | "losses" | "long" | "short";

export default function TradeHistory({ trades }: TradeHistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    switch (filter) {
      case "wins":
        return trades.filter((t) => t.pnl > 0);
      case "losses":
        return trades.filter((t) => t.pnl <= 0);
      case "long":
        return trades.filter((t) => t.direction === "long");
      case "short":
        return trades.filter((t) => t.direction === "short");
      default:
        return trades;
    }
  }, [trades, filter]);

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

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "wins", label: "Wins" },
    { key: "losses", label: "Losses" },
    { key: "long", label: "Long" },
    { key: "short", label: "Short" },
  ];

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all",
              filter === f.key
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1 opacity-60">
                {f.key === "wins"
                  ? trades.filter((t) => t.pnl > 0).length
                  : f.key === "losses"
                    ? trades.filter((t) => t.pnl <= 0).length
                    : f.key === "long"
                      ? trades.filter((t) => t.direction === "long").length
                      : trades.filter((t) => t.direction === "short").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-text-muted">No trades match this filter</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((trade) => (
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
              <div className="text-right">
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    trade.pnl >= 0 ? "text-profit" : "text-loss",
                  )}
                >
                  {trade.pnl >= 0 ? "+" : ""}
                  {formatCurrency(trade.pnl)}
                </span>
                <p className="text-[9px] text-text-muted tabular-nums">
                  {trade.pnl >= 0 ? "+" : ""}{((trade.pnl / trade.betAmount) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
