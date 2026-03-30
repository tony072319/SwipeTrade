import type { Candle, TimeFrame } from "@/types/chart";

const BASE_URL = "https://api.coingecko.com/api/v3";

// CoinGecko OHLC: days param determines candle granularity
// 1-2 days = 30min candles, 3-30 days = 4h candles, 31+ days = 4 day candles
// For /market_chart: granularity is auto — 1 day = 5min, 2-90 days = hourly, 90+ = daily
const DAYS_MAP: Record<TimeFrame, number> = {
  "1m": 1, // not supported well, fallback
  "5m": 1,
  "15m": 1,
  "1h": 90,
  "4h": 90,
  "1D": 365,
};

function aggregateTo4h(candles: Candle[]): Candle[] {
  const result: Candle[] = [];
  for (let i = 0; i < candles.length; i += 4) {
    const chunk = candles.slice(i, i + 4);
    if (chunk.length < 4) break;
    result.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((c) => c.high)),
      low: Math.min(...chunk.map((c) => c.low)),
      close: chunk[chunk.length - 1].close,
    });
  }
  return result;
}

export async function fetchCoinGeckoOHLCV(
  coingeckoId: string,
  timeframe: TimeFrame,
): Promise<Candle[]> {
  const days = DAYS_MAP[timeframe];

  if (timeframe === "1D") {
    // Use OHLC endpoint for daily candles
    const url = `${BASE_URL}/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(
        `CoinGecko OHLC error: ${res.status} ${res.statusText}`,
      );
    }

    // Response: [[timestamp, open, high, low, close], ...]
    const data: number[][] = await res.json();

    return data.map(([timestamp, open, high, low, close]) => ({
      time: Math.floor(timestamp / 1000),
      open,
      high,
      low,
      close,
    }));
  }

  // For hourly data, use market_chart endpoint and synthesize candles
  const url = `${BASE_URL}/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(
      `CoinGecko market_chart error: ${res.status} ${res.statusText}`,
    );
  }

  const data: { prices: number[][] } = await res.json();

  if (!data.prices || data.prices.length === 0) {
    throw new Error(`No price data for ${coingeckoId}`);
  }

  // Synthesize OHLC candles from price points
  // Group prices by hour
  const hourlyBuckets = new Map<number, number[]>();
  for (const [timestamp, price] of data.prices) {
    const hourKey = Math.floor(timestamp / 3600000) * 3600; // round to hour in seconds
    const bucket = hourlyBuckets.get(hourKey);
    if (bucket) {
      bucket.push(price);
    } else {
      hourlyBuckets.set(hourKey, [price]);
    }
  }

  let candles: Candle[] = Array.from(hourlyBuckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, prices]) => ({
      time,
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
    }));

  if (timeframe === "4h") {
    candles = aggregateTo4h(candles);
  }

  return candles;
}
