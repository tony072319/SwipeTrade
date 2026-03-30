"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  category: "basics" | "patterns" | "indicators" | "psychology";
  content: string[];
  tip: string;
}

const LESSONS: Lesson[] = [
  {
    id: "candlesticks",
    title: "Reading Candlesticks",
    category: "basics",
    content: [
      "Each candlestick shows 4 prices: Open, High, Low, and Close (OHLC).",
      "A green candle means the Close was higher than the Open — the price went up during that period.",
      "A red candle means the Close was lower than the Open — the price went down.",
      "The thin lines (wicks) show the highest and lowest prices reached during the period.",
      "Long wicks often indicate rejection — the market tried to push higher/lower but was pushed back.",
    ],
    tip: "Look for candles with long lower wicks near support levels — they often signal buying pressure.",
  },
  {
    id: "trends",
    title: "Identifying Trends",
    category: "basics",
    content: [
      "An uptrend is defined by higher highs and higher lows — each swing goes higher than the last.",
      "A downtrend has lower highs and lower lows — each swing goes lower.",
      "Sideways/range-bound markets move between support and resistance without making new highs or lows.",
      "The trend is your friend — it's generally easier to trade with the trend than against it.",
      "Trend changes often start with a break of the pattern: the first lower low in an uptrend could signal reversal.",
    ],
    tip: "Use the 'higher highs, higher lows' framework. If you see this pattern, lean Long.",
  },
  {
    id: "support-resistance",
    title: "Support & Resistance",
    category: "basics",
    content: [
      "Support is a price level where buying pressure tends to prevent further decline.",
      "Resistance is a price level where selling pressure tends to prevent further advance.",
      "These levels are formed by previous price reactions — old support can become new resistance and vice versa.",
      "The more times a level has been tested, the more significant it becomes.",
      "Breakouts above resistance or below support often lead to strong moves in that direction.",
    ],
    tip: "Draw horizontal lines at price levels where the candles have bounced multiple times.",
  },
  {
    id: "doji",
    title: "Doji & Indecision Patterns",
    category: "patterns",
    content: [
      "A Doji has nearly equal Open and Close — it looks like a cross or plus sign.",
      "Doji candles signal indecision between buyers and sellers.",
      "A Doji after a strong trend can signal an upcoming reversal — the momentum is fading.",
      "Hammer (bullish): small body at top, long lower wick. Shows sellers tried but buyers took control.",
      "Shooting Star (bearish): small body at bottom, long upper wick. Shows buyers tried but sellers took control.",
    ],
    tip: "A Doji alone isn't a signal — wait for the next candle to confirm the direction.",
  },
  {
    id: "engulfing",
    title: "Engulfing Patterns",
    category: "patterns",
    content: [
      "A Bullish Engulfing: a small red candle followed by a larger green candle that completely covers it.",
      "A Bearish Engulfing: a small green candle followed by a larger red candle that completely covers it.",
      "Engulfing patterns are strongest at the end of trends, near support/resistance levels.",
      "The larger the engulfing candle relative to the previous candle, the stronger the signal.",
      "Volume confirmation: higher volume on the engulfing candle adds reliability.",
    ],
    tip: "Look for engulfing patterns at key support/resistance levels for high-probability trades.",
  },
  {
    id: "ema",
    title: "Moving Averages (EMA)",
    category: "indicators",
    content: [
      "EMA (Exponential Moving Average) smooths price data to identify the trend direction.",
      "EMA 9 (short-term) reacts quickly to price changes. Good for spotting momentum shifts.",
      "EMA 21 (medium-term) is slower but more reliable for trend identification.",
      "When price is above the EMA, the trend is generally bullish. Below = bearish.",
      "EMA crossovers: when the fast EMA (9) crosses above the slow EMA (21), it's a bullish signal (Golden Cross). The reverse is a Death Cross.",
    ],
    tip: "Enable both EMA 9 and EMA 21 in SwipeTrade. When they cross, pay attention!",
  },
  {
    id: "rsi",
    title: "RSI (Relative Strength Index)",
    category: "indicators",
    content: [
      "RSI measures momentum on a scale of 0-100.",
      "RSI above 70 = overbought. The asset may have risen too fast and could pull back.",
      "RSI below 30 = oversold. The asset may have fallen too fast and could bounce.",
      "RSI divergence: when price makes a new high but RSI doesn't — this signals weakening momentum.",
      "In strong trends, RSI can stay overbought/oversold for extended periods. Don't blindly counter-trade.",
    ],
    tip: "RSI works best in ranging markets. In strong trends, use it to find pullback entries instead.",
  },
  {
    id: "macd",
    title: "MACD",
    category: "indicators",
    content: [
      "MACD shows the relationship between two moving averages.",
      "MACD Line = 12-period EMA minus 26-period EMA.",
      "Signal Line = 9-period EMA of the MACD Line.",
      "When MACD crosses above the Signal Line, it's a bullish signal. Below = bearish.",
      "The histogram shows the difference between MACD and Signal. Growing bars = increasing momentum.",
    ],
    tip: "Watch for MACD histogram bars getting smaller — it means the current move is losing steam.",
  },
  {
    id: "risk",
    title: "Risk Management",
    category: "psychology",
    content: [
      "Never risk more than you can afford to lose on a single trade.",
      "In SwipeTrade, each trade risks 10% of your portfolio. In real trading, 1-2% is standard.",
      "Higher leverage amplifies both gains AND losses. Start with 1x until you're consistent.",
      "Winning 6 out of 10 trades with a 2:1 reward-to-risk ratio makes you profitable.",
      "Focus on the process, not the outcome. A good trade can lose, and a bad trade can win.",
    ],
    tip: "Reduce your leverage to 1x when you're on a losing streak. Protect your capital.",
  },
  {
    id: "psychology",
    title: "Trading Psychology",
    category: "psychology",
    content: [
      "FOMO (Fear of Missing Out) causes traders to enter too late, chasing moves.",
      "Revenge trading after losses leads to emotional, oversized positions.",
      "Confirmation bias makes you see what you want to see in the chart, not what's actually there.",
      "The best traders are patient — they wait for high-probability setups instead of trading everything.",
      "Keep a trading journal. Reviewing your decisions helps identify patterns in your behavior.",
    ],
    tip: "After 2 losses in a row, take a break. Come back with fresh eyes.",
  },
];

const CATEGORIES = [
  { key: "all" as const, label: "All" },
  { key: "basics" as const, label: "Basics" },
  { key: "patterns" as const, label: "Patterns" },
  { key: "indicators" as const, label: "Indicators" },
  { key: "psychology" as const, label: "Psychology" },
];

type Category = "all" | Lesson["category"];

export default function LearnPage() {
  const [category, setCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = category === "all"
    ? LESSONS
    : LESSONS.filter((l) => l.category === category);

  return (
    <main className="min-h-dvh pb-20">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Learn to Trade</h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Master chart reading and technical analysis
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-4 pt-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              category === c.key
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lesson list */}
      <div className="px-4 mt-4 space-y-2">
        {filtered.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          return (
            <div
              key={lesson.id}
              className="rounded-xl border border-border bg-surface-secondary overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-bold">{lesson.title}</p>
                  <p className="text-[10px] text-text-muted capitalize">{lesson.category}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "text-text-muted transition-transform",
                    isExpanded && "rotate-180",
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                  <ul className="space-y-2">
                    {lesson.content.map((point, i) => (
                      <li key={i} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
                        <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Pro Tip</p>
                    <p className="text-xs text-text-secondary mt-0.5">{lesson.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-4 mt-6 text-center">
        <Link
          href="/play"
          className="inline-block rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Practice Now
        </Link>
        <p className="mt-2 text-[10px] text-text-muted">Apply what you learned in free play</p>
      </div>
    </main>
  );
}
