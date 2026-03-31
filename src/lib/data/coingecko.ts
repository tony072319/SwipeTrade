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

// In-memory cache for CoinGecko data
const candleCache = new Map<string, { data: Candle[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes (CoinGecko has rate limits)

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

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.status === 429) {
        // Rate limited — wait longer
        await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastError;
}

export async function fetchCoinGeckoOHLCV(
  coingeckoId: string,
  timeframe: TimeFrame,
): Promise<Candle[]> {
  const cacheKey = `${coingeckoId}:${timeframe}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const days = DAYS_MAP[timeframe];

  if (timeframe === "1D") {
    // Use OHLC endpoint for daily candles
    const url = `${BASE_URL}/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`;
    const res = await fetchWithRetry(url);

    // Response: [[timestamp, open, high, low, close], ...]
    const data: number[][] = await res.json();

    if (!data || data.length === 0) {
      throw new Error(`No OHLC data for ${coingeckoId}`);
    }

    const candles = data
      .filter((row) => row.length >= 5 && row.every((v) => v > 0))
      .map(([timestamp, open, high, low, close]) => ({
        time: Math.floor(timestamp / 1000),
        open,
        high,
        low,
        close,
      }));

    if (candles.length > 0) {
      candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
    }

    return candles;
  }

  // For hourly data, use market_chart endpoint and synthesize candles
  const url = `${BASE_URL}/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetchWithRetry(url);

  const data: { prices: number[][] } = await res.json();

  if (!data.prices || data.prices.length === 0) {
    throw new Error(`No price data for ${coingeckoId}`);
  }

  // Synthesize OHLC candles from price points
  // Group prices by hour
  const hourlyBuckets = new Map<number, number[]>();
  for (const [timestamp, price] of data.prices) {
    if (price <= 0) continue; // skip invalid prices
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
    .map(([time, prices]) => {
      const open = prices[0];
      const close = prices[prices.length - 1];
      let high = Math.max(...prices);
      let low = Math.min(...prices);

      // Ensure candles always have visible body and wicks
      // CoinGecko hourly buckets often have 1-2 price points → flat lines
      const body = Math.abs(close - open);
      const range = high - low;
      const midPrice = (open + close) / 2 || open;
      const minRange = midPrice * 0.003; // minimum 0.3% range

      if (range < minRange) {
        // Expand wicks so candle is visible
        const expand = (minRange - range) / 2;
        high += expand;
        low -= expand;
      }

      // Ensure body is visible (at least 0.05% of price)
      if (body < midPrice * 0.0005 && prices.length <= 2) {
        // Nudge close slightly to create a visible body
        const nudge = midPrice * 0.001;
        if (close >= open) {
          return { time, open: open - nudge * 0.3, high, low, close: close + nudge * 0.3 };
        } else {
          return { time, open: open + nudge * 0.3, high, low, close: close - nudge * 0.3 };
        }
      }

      return { time, open, high, low, close };
    });

  if (timeframe === "4h") {
    candles = aggregateTo4h(candles);
  }

  if (candles.length > 0) {
    candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
  }

  return candles;
}
