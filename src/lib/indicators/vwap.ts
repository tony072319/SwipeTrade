/**
 * Calculate VWAP (Volume-Weighted Average Price).
 * Uses cumulative (typical price * volume) / cumulative volume.
 * Returns null for candles with no volume data.
 */
export function calculateVWAP(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: (number | undefined | null)[],
): (number | null)[] {
  const result: (number | null)[] = [];
  let cumulativeTPV = 0;
  let cumulativeVol = 0;

  for (let i = 0; i < closes.length; i++) {
    const vol = volumes[i];
    if (vol == null || vol <= 0) {
      result.push(cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : null);
      continue;
    }

    const tp = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativeTPV += tp * vol;
    cumulativeVol += vol;
    result.push(cumulativeTPV / cumulativeVol);
  }

  return result;
}
