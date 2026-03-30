"use client";

import type { Asset, TimeFrame } from "@/types/chart";
import { TIMEFRAME_LABELS } from "@/lib/data/assets";

interface ChartOverlayProps {
  asset: Asset;
  timeframe: TimeFrame;
  onAssetClick?: () => void;
}

export default function ChartOverlay({
  asset,
  timeframe,
  onAssetClick,
}: ChartOverlayProps) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
      <button
        onClick={onAssetClick}
        className="pointer-events-auto rounded-lg bg-surface-secondary/90 px-2.5 py-1 text-sm font-black text-text-primary backdrop-blur-sm transition-colors hover:bg-surface-tertiary border border-glass-border"
      >
        {asset.symbol} ▾
      </button>
      <span className="rounded-lg bg-surface-secondary/90 px-2 py-1 text-[10px] font-bold text-text-secondary backdrop-blur-sm border border-glass-border">
        {TIMEFRAME_LABELS[timeframe]}
      </span>
      <span className="rounded-lg bg-surface-secondary/90 px-2 py-1 text-[10px] font-bold uppercase text-text-muted backdrop-blur-sm border border-glass-border">
        {asset.type}
      </span>
    </div>
  );
}
