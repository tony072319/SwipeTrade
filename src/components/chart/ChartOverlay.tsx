"use client";

import type { Asset, TimeFrame, Candle } from "@/types/chart";
import { TIMEFRAME_LABELS } from "@/lib/data/assets";
import MarketSentiment from "@/components/game/MarketSentiment";
import PatternLabels from "@/components/game/PatternLabels";

interface ChartOverlayProps {
  asset: Asset;
  timeframe: TimeFrame;
  onAssetClick?: () => void;
  candles?: Candle[];
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

        {/* OHLC of last candle */}
        {lastCandle && (
          <div className="mt-1 flex items-center gap-2 text-[9px] font-mono tabular-nums">
            <span className="text-text-muted">O <span className="text-text-secondary">{formatPrice(lastCandle.open)}</span></span>
            <span className="text-text-muted">H <span className="text-profit">{formatPrice(lastCandle.high)}</span></span>
            <span className="text-text-muted">L <span className="text-loss">{formatPrice(lastCandle.low)}</span></span>
            <span className="text-text-muted">C <span className={lastCandle.close >= lastCandle.open ? "text-profit" : "text-loss"}>{formatPrice(lastCandle.close)}</span></span>
            {lastCandle.volume && lastCandle.volume > 0 && (
              <span className="text-text-muted">Vol <span className="text-text-secondary">{lastCandle.volume >= 1_000_000 ? `${(lastCandle.volume / 1_000_000).toFixed(1)}M` : lastCandle.volume >= 1_000 ? `${(lastCandle.volume / 1_000).toFixed(1)}K` : lastCandle.volume.toFixed(0)}</span></span>
            )}
          </div>
        )}

        {candles && candles.length > 10 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <div className="rounded-lg bg-surface-secondary/80 px-2 py-1 backdrop-blur-sm border border-glass-border inline-flex">
              <MarketSentiment candles={candles} />
            </div>
            {/* Relative Volume (RVOL) */}
            {candles.some((c) => c.volume && c.volume > 0) && (() => {
              const vols = candles.filter((c) => c.volume && c.volume > 0).map((c) => c.volume!);
              if (vols.length < 5) return null;
              const avgVol = vols.slice(0, -1).reduce((s, v) => s + v, 0) / (vols.length - 1);
              const lastVol = vols[vols.length - 1];
              const rvol = avgVol > 0 ? lastVol / avgVol : 1;
              return (
                <span className={`rounded-lg bg-surface-secondary/80 px-2 py-1 text-[9px] font-bold backdrop-blur-sm border border-glass-border ${
                  rvol >= 2 ? "text-profit animate-pulse" : rvol >= 1.5 ? "text-accent" : "text-text-muted"
                }`}>
                  RVOL {rvol.toFixed(1)}x {rvol >= 2 ? "▲" : ""}
                </span>
              );
            })()}
            <PatternLabels candles={candles} />
          </div>
        )}
      </div>

      {/* Right side price info */}
      {candles && candles.length > 5 && (() => {
        const high = Math.max(...candles.map((c) => c.high));
        const low = Math.min(...candles.map((c) => c.low));
        const current = candles[candles.length - 1].close;

        // Simulate bid/ask spread (0.02-0.1% of price)
        const spreadPct = 0.0002 + Math.random() * 0.0008;
        const halfSpread = current * spreadPct / 2;
        const bid = current - halfSpread;
        const ask = current + halfSpread;

        return (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-0.5">
            <span className="rounded-md bg-profit/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-profit border border-profit/10">
              H {formatPrice(high)}
            </span>
            {/* Bid/Ask spread */}
            <div className="flex items-center gap-0.5">
              <span className="rounded-l-md bg-profit/10 px-1 py-0.5 text-[8px] font-mono tabular-nums text-profit border border-profit/10">
                B {formatPrice(bid)}
              </span>
              <span className="rounded-r-md bg-loss/10 px-1 py-0.5 text-[8px] font-mono tabular-nums text-loss border border-loss/10">
                A {formatPrice(ask)}
              </span>
            </div>
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums border ${
              current >= candles[0].open ? "bg-profit/10 text-profit border-profit/10" : "bg-loss/10 text-loss border-loss/10"
            }`}>
              C {formatPrice(current)}
            </span>
            <span className="rounded-md bg-loss/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-loss border border-loss/10">
              L {formatPrice(low)}
            </span>
            {/* Spread indicator */}
            <span className="mt-0.5 rounded-md bg-surface-secondary/60 px-1.5 py-0.5 text-[7px] font-mono text-text-muted/50 border border-glass-border">
              Spread {(spreadPct * 100).toFixed(3)}%
            </span>
            <span className="rounded-md bg-surface-secondary/60 px-1.5 py-0.5 text-[8px] font-mono text-text-muted/60 border border-glass-border">
              {candles.length} candles
            </span>
          </div>
        );
      })()}
    </>
  );
}
