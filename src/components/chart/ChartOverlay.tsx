"use client";

import type { Asset, TimeFrame, Candle } from "@/types/chart";
import { TIMEFRAME_LABELS } from "@/lib/data/assets";
import PatternLabels from "@/components/game/PatternLabels";

interface ChartOverlayProps {
  asset: Asset;
  timeframe: TimeFrame;
  onAssetClick?: () => void;
  candles?: Candle[];
  /** Original candles (before body nudging) for accurate pattern detection */
  rawCandles?: Candle[];
}

function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}

export default function ChartOverlay({
  asset,
  timeframe,
  onAssetClick,
  candles,
  rawCandles,
}: ChartOverlayProps) {
  const lastCandle = candles?.[candles.length - 1];
  const firstCandle = candles?.[0];

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onAssetClick}
            className="pointer-events-auto flex items-center gap-1 rounded-lg bg-surface-secondary/90 px-2.5 py-1.5 backdrop-blur-sm transition-colors hover:bg-surface-tertiary border border-glass-border"
          >
            <span className="text-sm font-black text-text-primary tracking-wide">{asset.symbol}</span>
            <span className="text-[10px] text-text-muted hidden sm:inline">{asset.name}</span>
            <span className="text-text-muted text-[10px]">▾</span>
          </button>
          <span className="rounded-lg bg-surface-secondary/90 px-2 py-1.5 text-[10px] font-bold text-text-secondary backdrop-blur-sm border border-glass-border">
            {TIMEFRAME_LABELS[timeframe]}
          </span>
          <span className={`rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase backdrop-blur-sm border ${
            asset.type === "crypto" ? "bg-accent/10 text-accent border-accent/20" : "bg-surface-secondary/90 text-text-muted border-glass-border"
          }`}>
            {asset.type === "crypto" ? "Crypto" : "Stock"}
          </span>
          {candles && candles.length > 1 && firstCandle && lastCandle && (() => {
            const pctChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
            const isUp = pctChange >= 0;
            return (
              <span className={`rounded-lg px-2 py-1.5 text-[10px] font-bold tabular-nums backdrop-blur-sm border ${
                isUp ? "bg-profit/10 text-profit border-profit/20" : "bg-loss/10 text-loss border-loss/20"
              }`}>
                {isUp ? "+" : ""}{pctChange.toFixed(2)}%
              </span>
            );
          })()}
        </div>

        {/* OHLC */}
        {lastCandle && (
          <div className="mt-0.5 flex items-center gap-2 text-[8px] font-mono tabular-nums">
            <span className="text-text-muted">O<span className="text-text-secondary ml-0.5">{formatPrice(lastCandle.open)}</span></span>
            <span className="text-text-muted">H<span className="text-profit ml-0.5">{formatPrice(lastCandle.high)}</span></span>
            <span className="text-text-muted">L<span className="text-loss ml-0.5">{formatPrice(lastCandle.low)}</span></span>
            <span className="text-text-muted">C<span className={`ml-0.5 ${lastCandle.close >= lastCandle.open ? "text-profit" : "text-loss"}`}>{formatPrice(lastCandle.close)}</span></span>
          </div>
        )}

        {/* Patterns — use raw (un-nudged) candles for accurate detection */}
        {(rawCandles || candles) && (rawCandles || candles)!.length > 10 && (
          <div className="mt-4">
            <PatternLabels candles={rawCandles || candles!} />
          </div>
        )}
      </div>

      {/* Right side price info */}
      {candles && candles.length > 5 && (() => {
        const high = Math.max(...candles.map((c) => c.high));
        const low = Math.min(...candles.map((c) => c.low));
        const current = candles[candles.length - 1].close;

        return (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-0.5">
            <span className="rounded-md bg-profit/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-profit border border-profit/10">
              H {formatPrice(high)}
            </span>
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums border ${
              current >= candles[0].open ? "bg-profit/10 text-profit border-profit/10" : "bg-loss/10 text-loss border-loss/10"
            }`}>
              C {formatPrice(current)}
            </span>
            <span className="rounded-md bg-loss/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-loss border border-loss/10">
              L {formatPrice(low)}
            </span>
          </div>
        );
      })()}
    </>
  );
}
