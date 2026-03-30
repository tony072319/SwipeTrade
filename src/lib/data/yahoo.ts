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

// How far back to look for each timeframe
const LOOKBACK_DAYS: Record<TimeFrame, number> = {
  "1m": 5,
  "5m": 55,
  "15m": 55,
  "1h": 55,
  "4h": 55,
  "1D": 730, // 2 years
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

export async function fetchYahooOHLCV(
  symbol: string,
  timeframe: TimeFrame,
): Promise<Candle[]> {
  // yahoo-finance2 v3 requires `new YahooFinance()` constructor
  const YahooFinance = (await import("yahoo-finance2")).default;
  const yf = new YahooFinance();

  const interval = INTERVAL_MAP[timeframe];
  const days = LOOKBACK_DAYS[timeframe];
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await yf.chart(symbol, {
    period1,
    interval,
  });

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

  if (timeframe === "4h") {
    candles = aggregateTo4h(candles);
  }

  return candles;
}
