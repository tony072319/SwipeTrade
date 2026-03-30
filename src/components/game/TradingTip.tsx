"use client";

import { useState, useEffect } from "react";

const TIPS = [
  "Long wicks often indicate price rejection — watch the direction of the wick.",
  "Three green candles in a row with increasing volume? Strong bullish momentum.",
  "Don't fight the trend — the trend is your friend until the end.",
  "RSI above 70 doesn't always mean sell — in strong uptrends, it can stay overbought.",
  "Look for volume spikes at key support/resistance levels for confirmation.",
  "A small candle after a big candle often signals indecision — be cautious.",
  "EMA crossovers work best when the market has clear trends, not in choppy markets.",
  "If the chart has been ranging for many candles, expect a breakout soon.",
  "Descending triangle pattern? Watch for a breakdown below support.",
  "Higher timeframes give more reliable signals — when in doubt, zoom out.",
  "Bollinger Band squeeze = low volatility = big move incoming.",
  "Don't chase! If the move already happened, wait for the next setup.",
  "Pay attention to where the candle closes relative to its range.",
  "A hammer candle at support is one of the most reliable bullish reversal signals.",
  "Volume declining during a trend? The trend may be running out of steam.",
];

export default function TradingTip() {
  const [tip, setTip] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show a random tip occasionally
    const shown = sessionStorage.getItem("swipetrade-tip-shown");
    if (shown) return;

    const index = Math.floor(Math.random() * TIPS.length);
    setTip(TIPS[index]);
    setVisible(true);
    sessionStorage.setItem("swipetrade-tip-shown", "true");

    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !tip) return null;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-10 animate-slide-up">
      <div className="rounded-xl border border-accent/20 bg-surface-secondary/95 px-4 py-3 backdrop-blur-xl shadow-lg">
        <div className="flex items-start gap-2">
          <span className="text-accent text-sm shrink-0">💡</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Tip</p>
            <p className="text-xs text-text-secondary leading-relaxed mt-0.5">{tip}</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="shrink-0 text-text-muted hover:text-text-secondary ml-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
