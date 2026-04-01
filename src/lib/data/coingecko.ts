import type { Candle, TimeFrame } from "@/types/chart";

const BASE_URL = "https://api.coingecko.com/api/v3";

// CoinGecko OHLC: days param determines candle granularity
// 1-2 days = 30min candles, 3-30 days = 4h candles, 31+ days = 4 day candles
// For /market_chart: granularity is auto — 1 day = 5min, 2-90 days = hourly, 90+ = daily
const DAYS_MAP: Record<TimeFrame, number> = {
  "1m": 1, // not supported well, fallback
  "5m": 1,
  "15m": 1,
  "1h": 30,  // Use 30 days for OHLC endpoint (gives 4h candles we can use)
  "4h": 30,
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

  // Use the OHLC endpoint for ALL timeframes — it returns proper candlestick data
  // 1-2 days = 30min candles, 3-30 days = 4h candles, 31+ days = 4-day candles
  const url = `${BASE_URL}/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`;
  const res = await fetchWithRetry(url);

  // Response: [[timestamp, open, high, low, close], ...]
  const data: number[][] = await res.json();

  if (!data || data.length === 0) {
    throw new Error(`No OHLC data for ${coingeckoId}`);
  }

  let candles: Candle[] = data
    .filter((row) => row.length >= 5 && row.every((v) => v > 0))
    .map(([timestamp, open, high, low, close]) => ({
      time: Math.floor(timestamp / 1000),
      open,
      high,
      low,
      close,
    }));

  // Remove duplicates by timestamp
  const seen = new Set<number>();
  candles = candles.filter((c) => {
    if (seen.has(c.time)) return false;
    seen.add(c.time);
    return true;
  });

  if (candles.length > 0) {
    candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
  }

  return candles;
}
