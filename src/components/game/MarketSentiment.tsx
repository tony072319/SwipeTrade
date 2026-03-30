"use client";

import { useMemo } from "react";
import type { Candle } from "@/types/chart";
import { cn } from "@/lib/utils";

interface MarketSentimentProps {
  candles: Candle[];
}

interface SentimentResult {
  label: string;
  score: number; // -100 to 100
  signals: string[];
}

function analyzeSentiment(candles: Candle[]): SentimentResult {
  if (candles.length < 10) return { label: "Neutral", score: 0, signals: [] };

  const signals: string[] = [];
  let score = 0;

  // 1. Trend: compare recent vs earlier closes
  const recentCloses = candles.slice(-5).map((c) => c.close);
  const earlierCloses = candles.slice(-15, -5).map((c) => c.close);
  const recentAvg = recentCloses.reduce((s, v) => s + v, 0) / recentCloses.length;
  const earlierAvg = earlierCloses.length > 0
    ? earlierCloses.reduce((s, v) => s + v, 0) / earlierCloses.length
    : recentAvg;

  if (recentAvg > earlierAvg * 1.01) {
    score += 30;
    signals.push("Uptrend");
  } else if (recentAvg < earlierAvg * 0.99) {
    score -= 30;
    signals.push("Downtrend");
  } else {
    signals.push("Ranging");
  }

  // 2. Recent momentum: last 3 candles
  const last3 = candles.slice(-3);
  const greenCount = last3.filter((c) => c.close > c.open).length;
  if (greenCount === 3) {
    score += 20;
    signals.push("Strong momentum");
  } else if (greenCount === 0) {
    score -= 20;
    signals.push("Selling pressure");
  }

  // 3. Last candle analysis
  const lastCandle = candles[candles.length - 1];
  const bodySize = Math.abs(lastCandle.close - lastCandle.open);
  const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
  const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;

  if (lowerWick > bodySize * 2 && lastCandle.close > lastCandle.open) {
    score += 15;
    signals.push("Hammer pattern");
  } else if (upperWick > bodySize * 2 && lastCandle.close < lastCandle.open) {
    score -= 15;
    signals.push("Shooting star");
  }

  // 4. Volatility
  const ranges = candles.slice(-10).map((c) => (c.high - c.low) / c.low);
  const avgRange = ranges.reduce((s, v) => s + v, 0) / ranges.length;
  if (avgRange > 0.03) {
    signals.push("High volatility");
  }

  // Clamp score
  score = Math.max(-100, Math.min(100, score));

  const label = score >= 25 ? "Bullish" : score <= -25 ? "Bearish" : "Neutral";

  return { label, score, signals: signals.slice(0, 3) };
}

export default function MarketSentiment({ candles }: MarketSentimentProps) {
  const sentiment = useMemo(() => analyzeSentiment(candles), [candles]);

  const barWidth = Math.abs(sentiment.score);
  const color = sentiment.score >= 25 ? "profit" : sentiment.score <= -25 ? "loss" : "text-muted";

  return (
    <div className="flex items-center gap-2">
      {/* Sentiment dot */}
      <div className={cn(
        "h-2 w-2 rounded-full",
        color === "profit" && "bg-profit",
        color === "loss" && "bg-loss",
        color === "text-muted" && "bg-text-muted",
      )} />

      {/* Label */}
      <span className={cn(
        "text-[10px] font-bold",
        color === "profit" && "text-profit",
        color === "loss" && "text-loss",
        color === "text-muted" && "text-text-muted",
      )}>
        {sentiment.label}
      </span>

      {/* Mini bar */}
      <div className="relative h-1.5 w-12 rounded-full bg-surface-tertiary overflow-hidden">
        <div
          className={cn(
            "absolute top-0 h-full rounded-full transition-all",
            sentiment.score >= 0 ? "left-1/2 bg-profit" : "right-1/2 bg-loss",
          )}
          style={{ width: `${barWidth / 2}%` }}
        />
        <div className="absolute top-0 left-1/2 h-full w-px bg-text-muted/30" />
      </div>

      {/* Signal tags */}
      {sentiment.signals.slice(0, 2).map((s, i) => (
        <span key={i} className="text-[8px] text-text-muted/60 hidden sm:inline">
          {s}
        </span>
      ))}
    </div>
  );
}
