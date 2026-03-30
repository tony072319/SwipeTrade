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

export default function ChartOverlay({
  asset,
  timeframe,
  onAssetClick,
  candles,
}: ChartOverlayProps) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10">
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAssetClick}
          className="pointer-events-auto rounded-lg bg-surface-secondary/90 px-2.5 py-1 backdrop-blur-sm transition-colors hover:bg-surface-tertiary border border-glass-border"
        >
          <span className="text-sm font-black text-text-primary">{asset.symbol}</span>
          <span className="ml-1 text-[10px] text-text-muted">{asset.name}</span>
          <span className="ml-0.5 text-text-muted"> ▾</span>
        </button>
        <span className="rounded-lg bg-surface-secondary/90 px-2 py-1 text-[10px] font-bold text-text-secondary backdrop-blur-sm border border-glass-border">
          {TIMEFRAME_LABELS[timeframe]}
        </span>
        <span className="rounded-lg bg-surface-secondary/90 px-2 py-1 text-[10px] font-bold uppercase text-text-muted backdrop-blur-sm border border-glass-border">
          {asset.type}
        </span>
        {candles && candles.length > 1 && (() => {
          const first = candles[0].open;
          const last = candles[candles.length - 1].close;
          const pctChange = ((last - first) / first) * 100;
          const isUp = pctChange >= 0;
          return (
            <span className={`rounded-lg px-2 py-1 text-[10px] font-bold tabular-nums backdrop-blur-sm border ${
              isUp ? "bg-profit/10 text-profit border-profit/20" : "bg-loss/10 text-loss border-loss/20"
            }`}>
              {isUp ? "+" : ""}{pctChange.toFixed(2)}%
            </span>
          );
        })()}
      </div>
      {candles && candles.length > 10 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <div className="rounded-lg bg-surface-secondary/80 px-2 py-1 backdrop-blur-sm border border-glass-border inline-flex">
            <MarketSentiment candles={candles} />
          </div>
          <PatternLabels candles={candles} />
        </div>
      )}
    </div>
  );
}
