"use client";

import type { Asset, TimeFrame } from "@/types/chart";
import { TIMEFRAME_LABELS } from "@/lib/data/assets";

interface ChartOverlayProps {
  asset: Asset;
  timeframe: TimeFrame;
}

export default function ChartOverlay({ asset, timeframe }: ChartOverlayProps) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
      <span className="rounded-md bg-surface-secondary/80 px-2.5 py-1 text-sm font-semibold text-text-primary backdrop-blur-sm">
        {asset.symbol}
      </span>
      <span className="rounded-md bg-surface-secondary/80 px-2 py-1 text-xs text-text-secondary backdrop-blur-sm">
        {TIMEFRAME_LABELS[timeframe]}
      </span>
      <span className="rounded-md bg-surface-secondary/80 px-2 py-1 text-xs capitalize text-text-muted backdrop-blur-sm">
        {asset.type}
      </span>
    </div>
  );
}
