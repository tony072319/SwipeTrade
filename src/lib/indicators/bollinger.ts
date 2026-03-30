import { calculateSMA } from "./sma";

export interface BollingerResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollinger(
  closes: number[],
  period: number = 20,
  stdDev: number = 2,
): BollingerResult {
  const middle = calculateSMA(closes, period);

  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || middle[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance =
      slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);

    upper.push(mean + stdDev * sd);
    lower.push(mean - stdDev * sd);
  }

  return { upper, middle, lower };
}
