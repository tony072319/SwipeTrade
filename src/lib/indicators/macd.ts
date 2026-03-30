import { calculateEMA } from "./ema";

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDResult {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine: (number | null)[] = fastEMA.map((fast, i) => {
    const slow = slowEMA[i];
    if (fast === null || slow === null) return null;
    return fast - slow;
  });

  // Signal line = EMA of MACD line
  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalEMA = calculateEMA(validMacd, signalPeriod);

  // Map signal back to full length
  const signal: (number | null)[] = [];
  let signalIdx = 0;
  for (const m of macdLine) {
    if (m === null) {
      signal.push(null);
    } else {
      signal.push(signalEMA[signalIdx] ?? null);
      signalIdx++;
    }
  }

  // Histogram = MACD - Signal
  const histogram: (number | null)[] = macdLine.map((m, i) => {
    const s = signal[i];
    if (m === null || s === null) return null;
    return m - s;
  });

  return { macd: macdLine, signal, histogram };
}
