"use client";

import { useState, useMemo } from "react";
import type { Trade } from "@/types/trade";
import { formatCurrency, cn } from "@/lib/utils";

interface TradeHistoryProps {
  trades: Trade[];
}

type Filter = "all" | "wins" | "losses" | "long" | "short";

function TradeDetailRow({ trade }: { trade: Trade }) {
  const priceChange = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
  const isUp = trade.exitPrice >= trade.entryPrice;

  return (
    <div className="px-4 pb-3 pt-1 animate-fade-in">
      <div className="rounded-xl bg-surface-tertiary/50 p-3 space-y-2.5">
        {/* Price movement visualization */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
              <span>Entry</span>
              <span>Exit</span>
            </div>
            <div className="relative h-6 rounded-full bg-surface overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all",
                  isUp ? "bg-profit/20" : "bg-loss/20",
                )}
                style={{ width: `${Math.min(Math.abs(priceChange) * 5 + 50, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className="text-[10px] font-mono font-bold text-text-primary">
                  {formatPrice(trade.entryPrice)}
                </span>
                <svg width="16" height="8" viewBox="0 0 16 8" className={cn("shrink-0", isUp ? "text-profit" : "text-loss")}>
                  <path d="M0 4h14M10 0l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className={cn("text-[10px] font-mono font-bold", isUp ? "text-profit" : "text-loss")}>
                  {formatPrice(trade.exitPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[8px] uppercase text-text-muted">Bet Size</p>
            <p className="text-xs font-bold tabular-nums">{formatCurrency(trade.betAmount)}</p>
          </div>
          <div>
            <p className="text-[8px] uppercase text-text-muted">Price Move</p>
            <p className={cn("text-xs font-bold tabular-nums", isUp ? "text-profit" : "text-loss")}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase text-text-muted">Return</p>
            <p className={cn("text-xs font-bold tabular-nums", trade.pnl >= 0 ? "text-profit" : "text-loss")}>
              {trade.pnl >= 0 ? "+" : ""}{((trade.pnl / trade.betAmount) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted">
            {trade.assetType === "crypto" ? "Crypto" : "Stock"}
          </span>
          <span className="rounded-md bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted">
            {trade.timeframe}
          </span>
          {trade.isDailyChallenge && (
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
              Daily Challenge
            </span>
          )}
          {trade.leverage > 1 && (
            <span className="rounded-md bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted">
              {trade.leverage}x Leverage
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toFixed(0)}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <div key={trade.id}>
              <button
                onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-surface-secondary/30"
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
                  <div className="text-left">
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

                {/* P&L + expand indicator */}
                <div className="flex items-center gap-2">
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
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className={cn(
                      "text-text-muted transition-transform",
                      expandedId === trade.id && "rotate-180",
                    )}
                  >
                    <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === trade.id && <TradeDetailRow trade={trade} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
