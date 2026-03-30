"use client";

import { useMemo } from "react";
import type { Candle } from "@/types/chart";
import { detectPatterns } from "@/lib/patterns";
import { cn } from "@/lib/utils";

interface PatternLabelsProps {
  candles: Candle[];
}

export default function PatternLabels({ candles }: PatternLabelsProps) {
  const patterns = useMemo(() => detectPatterns(candles), [candles]);

  if (patterns.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {patterns.map((p, i) => (
        <span
          key={`${p.name}-${p.index}-${i}`}
          className={cn(
            "rounded-md px-2 py-0.5 text-[9px] font-bold inline-flex items-center gap-1",
            p.type === "bullish" && "bg-profit/10 text-profit border border-profit/20",
            p.type === "bearish" && "bg-loss/10 text-loss border border-loss/20",
            p.type === "neutral" && "bg-surface-tertiary text-text-muted border border-border",
          )}
        >
          {p.type === "bullish" && (
            <svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 1l3 5H1z" fill="currentColor" /></svg>
          )}
          {p.type === "bearish" && (
            <svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 7l3-5H1z" fill="currentColor" /></svg>
          )}
          {p.name}
          {p.strength >= 3 && <span className="opacity-60">!</span>}
        </span>
      ))}
    </div>
  );
}
