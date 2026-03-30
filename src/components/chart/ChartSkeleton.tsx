"use client";

import { useMemo } from "react";

const LOADING_TIPS = [
  "Tip: Long wicks show rejection zones",
  "Tip: Volume confirms price movements",
  "Tip: Trade with the trend, not against it",
  "Tip: Three green soldiers signal strength",
  "Tip: Use the Skip button to reveal instantly",
  "Tip: Press L for Long, S for Short",
  "Tip: Higher leverage = higher risk",
  "Tip: Look for support and resistance levels",
  "Tip: Doji candles signal indecision",
  "Tip: EMA crossovers can signal trend changes",
  "Tip: SMA 50 crossing above SMA 200 = Golden Cross",
  "Tip: VWAP shows where big money is buying/selling",
  "Tip: RSI above 70 = overbought, below 30 = oversold",
  "Tip: Bollinger Band squeeze often precedes big moves",
  "Tip: Engulfing candles are strong reversal signals",
  "Tip: Morning star patterns signal bullish reversals",
  "Tip: Higher timeframes give more reliable signals",
  "Tip: Don't fight the Fed — macro matters",
  "Tip: MACD histogram divergence warns of trend weakness",
  "Tip: Try the Gauntlet in Challenges for a 5-round test",
];

export default function ChartSkeleton() {
  const tip = useMemo(
    () => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)],
    [],
  );

  return (
    <div className="relative flex h-full w-full items-end gap-1.5 p-8 pb-12 opacity-20">
      {Array.from({ length: 30 }).map((_, i) => {
        const height = 20 + Math.random() * 60;
        const isGreen = Math.random() > 0.45;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm animate-pulse"
            style={{
              height: `${height}%`,
              backgroundColor: isGreen ? "#00dc82" : "#ff4757",
              animationDelay: `${i * 0.05}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        );
      })}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center opacity-100">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-text-muted border-t-accent mx-auto" />
        <p className="mt-3 text-xs text-text-muted">{tip}</p>
      </div>
    </div>
  );
}
