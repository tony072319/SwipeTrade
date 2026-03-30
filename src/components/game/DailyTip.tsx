"use client";

import { useMemo } from "react";

const DAILY_TIPS = [
  { title: "Volume Confirms", body: "Rising prices with rising volume = strong trend. Rising prices with declining volume = weakening trend." },
  { title: "The 3-Candle Rule", body: "Wait for 3 consecutive candles in one direction before confirming a trend change." },
  { title: "Wicks Tell Stories", body: "Long upper wicks mean sellers stepped in. Long lower wicks mean buyers defended the level." },
  { title: "Support Becomes Resistance", body: "When price breaks below support, that old support often becomes new resistance (and vice versa)." },
  { title: "Don't Fight the Trend", body: "Trading with the trend gives you a statistical edge. Only experienced traders should trade counter-trend." },
  { title: "Doji = Indecision", body: "A doji (open = close) often signals a potential reversal, especially after a long trend." },
  { title: "RSI Divergence", body: "When price makes a new high but RSI doesn't, it signals weakening momentum — a potential reversal." },
  { title: "Bollinger Squeeze", body: "When Bollinger Bands tighten, a big move is coming. Trade the breakout direction." },
  { title: "EMA Crossovers", body: "When EMA 9 crosses above EMA 21, it's bullish. Below = bearish. Best on higher timeframes." },
  { title: "Risk Management", body: "Never risk more than you can afford to lose on a single trade. Consistent small wins beat occasional big ones." },
  { title: "Gap Trading", body: "Price gaps often get 'filled' — the market tends to return to the pre-gap level before continuing." },
  { title: "Double Tops/Bottoms", body: "When price tests the same level twice and fails, expect a reversal. It's one of the most reliable patterns." },
  { title: "Morning Star", body: "A bearish candle, small-body candle, then bullish candle = Morning Star. Strong bullish reversal pattern." },
  { title: "MACD Histogram", body: "When MACD histogram shrinks, momentum is fading. Growing histogram = strengthening momentum." },
];

export default function DailyTip() {
  const tip = useMemo(() => {
    // Rotate based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  }, []);

  return (
    <div className="rounded-xl border border-accent/10 bg-accent/5 p-4">
      <div className="flex items-start gap-2">
        <span className="text-accent text-lg shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold text-accent">{tip.title}</p>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{tip.body}</p>
        </div>
      </div>
    </div>
  );
}
