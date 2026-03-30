import type { Candle, TimeFrame } from "@/types/chart";

type YahooInterval = "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo";

const INTERVAL_MAP: Record<TimeFrame, YahooInterval> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "60m",
  "4h": "60m", // fetch hourly, aggregate to 4h
  "1D": "1d",
};

// Increased lookback for more data availability
const LOOKBACK_DAYS: Record<TimeFrame, number> = {
  "1m": 7,       // Yahoo allows up to 7 days for 1m
  "5m": 60,      // ~2 months
  "15m": 60,
  "1h": 120,     // ~4 months
  "4h": 120,
  "1D": 730,     // 2 years
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
      volume: chunk.reduce((sum, c) => sum + (c.volume ?? 0), 0),
    });
  }
  return result;
}

// Simple in-memory cache to reduce API calls and improve consistency
const candleCache = new Map<string, { data: Candle[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(symbol: string, timeframe: TimeFrame): string {
  return `${symbol}:${timeframe}`;
}

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

export async function fetchYahooOHLCV(
  symbol: string,
  timeframe: TimeFrame,
): Promise<Candle[]> {
  // Check cache first
  const cacheKey = getCacheKey(symbol, timeframe);
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // yahoo-finance2 v3 requires `new YahooFinance()` constructor
  const YahooFinance = (await import("yahoo-finance2")).default;
  const yf = new YahooFinance();

  const interval = INTERVAL_MAP[timeframe];
  const days = LOOKBACK_DAYS[timeframe];
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await fetchWithRetry(() =>
    yf.chart(symbol, { period1, interval }),
  );

  if (!result.quotes || result.quotes.length === 0) {
    throw new Error(`No data returned for ${symbol}`);
  }

  let candles: Candle[] = result.quotes
    .filter(
      (q) =>
        q.open != null &&
        q.high != null &&
        q.low != null &&
        q.close != null &&
        q.date != null,
    )
    .map((q) => ({
      time: Math.floor(q.date.getTime() / 1000),
      open: q.open!,
      high: q.high!,
      low: q.low!,
      close: q.close!,
      volume: q.volume ?? undefined,
    }));

  // Filter out candles with zero or negative values
  candles = candles.filter(
    (c) => c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0,
  );

  // Remove duplicates by timestamp
  const seen = new Set<number>();
  candles = candles.filter((c) => {
    if (seen.has(c.time)) return false;
    seen.add(c.time);
    return true;
  });

  if (timeframe === "4h") {
    candles = aggregateTo4h(candles);
  }

  // Cache the result
  if (candles.length > 0) {
    candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
  }

  return candles;
}
