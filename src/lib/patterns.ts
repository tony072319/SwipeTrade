import type { Candle } from "@/types/chart";

export interface PatternMatch {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  index: number; // index of the last candle in the pattern
  strength: number; // 1-3
}

function bodySize(c: Candle): number {
  return Math.abs(c.close - c.open);
}

function isGreen(c: Candle): boolean {
  return c.close > c.open;
}

function isRed(c: Candle): boolean {
  return c.close < c.open;
}

function upperWick(c: Candle): number {
  return c.high - Math.max(c.open, c.close);
}

function lowerWick(c: Candle): number {
  return Math.min(c.open, c.close) - c.low;
}

function totalRange(c: Candle): number {
  return c.high - c.low;
}

export function detectPatterns(candles: Candle[]): PatternMatch[] {
  const patterns: PatternMatch[] = [];
  if (candles.length < 5) return patterns;

  // Only look at the last 20 candles for performance
  const start = Math.max(0, candles.length - 20);

  for (let i = start + 2; i < candles.length; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    const prev2 = candles[i - 2];
    const range = totalRange(c);
    if (range === 0) continue;

    const body = bodySize(c);
    const prevBody = bodySize(prev);

    // Doji — extremely strict to avoid false positives with flat data
    // Body must be < 2% of range, range must be > 1% of price,
    // both wicks must be substantial (> 3x body), and body must be non-trivial
    const avgBody = candles.slice(Math.max(0, i - 5), i).reduce((s, x) => s + bodySize(x), 0) / Math.min(5, i);
    if (
      body < range * 0.02 &&
      range > c.close * 0.01 &&
      upperWick(c) > body * 3 &&
      lowerWick(c) > body * 3 &&
      avgBody > body * 3 // surrounding candles must have bigger bodies (this IS a standout doji)
    ) {
      patterns.push({ name: "Doji", type: "neutral", index: i, strength: 1 });
    }

    // Hammer (bullish reversal)
    if (
      lowerWick(c) > body * 2 &&
      upperWick(c) < body * 0.5 &&
      isGreen(c) &&
      isRed(prev) &&
      isRed(prev2)
    ) {
      patterns.push({ name: "Hammer", type: "bullish", index: i, strength: 2 });
    }

    // Shooting Star (bearish reversal)
    if (
      upperWick(c) > body * 2 &&
      lowerWick(c) < body * 0.5 &&
      isRed(c) &&
      isGreen(prev) &&
      isGreen(prev2)
    ) {
      patterns.push({ name: "Shooting Star", type: "bearish", index: i, strength: 2 });
    }

    // Bullish Engulfing
    if (
      isGreen(c) &&
      isRed(prev) &&
      c.open < prev.close &&
      c.close > prev.open &&
      body > prevBody * 1.3
    ) {
      patterns.push({ name: "Bullish Engulfing", type: "bullish", index: i, strength: 2 });
    }

    // Bearish Engulfing
    if (
      isRed(c) &&
      isGreen(prev) &&
      c.open > prev.close &&
      c.close < prev.open &&
      body > prevBody * 1.3
    ) {
      patterns.push({ name: "Bearish Engulfing", type: "bearish", index: i, strength: 2 });
    }

    // Morning Star (bullish, 3-candle)
    if (
      i >= start + 2 &&
      isRed(prev2) &&
      bodySize(prev2) > totalRange(prev2) * 0.5 &&
      bodySize(prev) < totalRange(prev2) * 0.3 &&
      isGreen(c) &&
      body > totalRange(prev2) * 0.5
    ) {
      patterns.push({ name: "Morning Star", type: "bullish", index: i, strength: 3 });
    }

    // Evening Star (bearish, 3-candle)
    if (
      i >= start + 2 &&
      isGreen(prev2) &&
      bodySize(prev2) > totalRange(prev2) * 0.5 &&
      bodySize(prev) < totalRange(prev2) * 0.3 &&
      isRed(c) &&
      body > totalRange(prev2) * 0.5
    ) {
      patterns.push({ name: "Evening Star", type: "bearish", index: i, strength: 3 });
    }

    // Three White Soldiers (bullish)
    if (
      i >= start + 2 &&
      isGreen(c) &&
      isGreen(prev) &&
      isGreen(prev2) &&
      c.close > prev.close &&
      prev.close > prev2.close &&
      bodySize(c) > totalRange(c) * 0.5 &&
      bodySize(prev) > totalRange(prev) * 0.5 &&
      bodySize(prev2) > totalRange(prev2) * 0.5
    ) {
      patterns.push({ name: "Three White Soldiers", type: "bullish", index: i, strength: 3 });
    }

    // Three Black Crows (bearish)
    if (
      i >= start + 2 &&
      isRed(c) &&
      isRed(prev) &&
      isRed(prev2) &&
      c.close < prev.close &&
      prev.close < prev2.close &&
      bodySize(c) > totalRange(c) * 0.5 &&
      bodySize(prev) > totalRange(prev) * 0.5 &&
      bodySize(prev2) > totalRange(prev2) * 0.5
    ) {
      patterns.push({ name: "Three Black Crows", type: "bearish", index: i, strength: 3 });
    }

    // Inverted Hammer (bullish reversal candidate)
    if (
      upperWick(c) > body * 2 &&
      lowerWick(c) < body * 0.5 &&
      isGreen(c) &&
      isRed(prev) &&
      isRed(prev2)
    ) {
      patterns.push({ name: "Inverted Hammer", type: "bullish", index: i, strength: 2 });
    }

    // Hanging Man (bearish reversal)
    if (
      lowerWick(c) > body * 2 &&
      upperWick(c) < body * 0.5 &&
      isRed(c) &&
      isGreen(prev) &&
      isGreen(prev2)
    ) {
      patterns.push({ name: "Hanging Man", type: "bearish", index: i, strength: 2 });
    }

    // Tweezer Bottom (bullish)
    if (
      isGreen(c) &&
      isRed(prev) &&
      Math.abs(c.low - prev.low) < range * 0.05
    ) {
      patterns.push({ name: "Tweezer Bottom", type: "bullish", index: i, strength: 2 });
    }

    // Tweezer Top (bearish)
    if (
      isRed(c) &&
      isGreen(prev) &&
      Math.abs(c.high - prev.high) < range * 0.05
    ) {
      patterns.push({ name: "Tweezer Top", type: "bearish", index: i, strength: 2 });
    }
  }

  // Deduplicate — only keep the strongest pattern per index
  const byIndex = new Map<number, PatternMatch>();
  for (const p of patterns) {
    const existing = byIndex.get(p.index);
    if (!existing || p.strength > existing.strength) {
      byIndex.set(p.index, p);
    }
  }

  // Deduplicate by pattern name too — only keep the latest of each name
  const byName = new Map<string, PatternMatch>();
  for (const p of byIndex.values()) {
    const existing = byName.get(p.name);
    if (!existing || p.index > existing.index) {
      byName.set(p.name, p);
    }
  }

  // Only return last 3 unique patterns to avoid clutter
  return Array.from(byName.values())
    .sort((a, b) => a.index - b.index)
    .slice(-3);
}
