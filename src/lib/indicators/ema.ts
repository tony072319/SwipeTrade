export function calculateEMA(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      // First EMA is SMA
      const sum = closes.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
      continue;
    }

    const prev = result[i - 1]!;
    result.push((closes[i] - prev) * multiplier + prev);
  }

  return result;
}
