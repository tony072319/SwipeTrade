import type { Asset, TimeFrame, ChartData, Candle } from "@/types/chart";
import { ALL_ASSETS, TIMEFRAMES_BY_TYPE } from "./assets";
import { fetchYahooOHLCV } from "./yahoo";
import { fetchCoinGeckoOHLCV } from "./coingecko";
import { VISIBLE_CANDLES, HIDDEN_CANDLES } from "@/lib/game/constants";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Weight toward longer timeframes that have more reliable data
const TIMEFRAME_WEIGHTS: Record<string, number> = {
  "1m": 1, "5m": 2, "15m": 3, "1h": 5, "4h": 6, "1D": 8,
};

function weightedPickTimeframe(timeframes: TimeFrame[]): TimeFrame {
  const totalWeight = timeframes.reduce((sum, tf) => sum + (TIMEFRAME_WEIGHTS[tf] ?? 1), 0);
  let r = Math.random() * totalWeight;
  for (const tf of timeframes) {
    r -= TIMEFRAME_WEIGHTS[tf] ?? 1;
    if (r <= 0) return tf;
  }
  return timeframes[timeframes.length - 1];
}

// Shuffle array using Fisher-Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchCandles(
  asset: Asset,
  timeframe: TimeFrame,
): Promise<Candle[]> {
  if (asset.type === "crypto" && asset.coingeckoId) {
    return fetchCoinGeckoOHLCV(asset.coingeckoId, timeframe);
  }
  return fetchYahooOHLCV(asset.symbol, timeframe);
}

// Validate candle quality — reject windows with flat/suspicious data
function validateWindow(candles: Candle[]): boolean {
  if (candles.length === 0) return false;

  // Check that prices are reasonable (no zeros, no NaN)
  for (const c of candles) {
    if (!c.open || !c.high || !c.low || !c.close) return false;
    if (c.high < c.low) return false;
    if (c.open <= 0 || c.close <= 0) return false;
  }

  // Check that there's meaningful price movement (not all identical)
  const closes = candles.map((c) => c.close);
  const uniqueCloses = new Set(closes);
  if (uniqueCloses.size < Math.min(5, candles.length / 2)) return false;

  // Check max move isn't insane (>500% in window = probably bad data)
  const minPrice = Math.min(...closes);
  const maxPrice = Math.max(...closes);
  if (minPrice > 0 && maxPrice / minPrice > 6) return false;

  return true;
}

// Fix candle data at the window level — this is the FINAL pass before rendering.
// 1. Clamp outlier wicks that distort the price scale
// 2. Ensure every candle has a visible body relative to the window's price range
function fixCandleWindow(candles: Candle[]): Candle[] {
  if (candles.length < 3) return candles;

  // Step 1: Clamp outlier spikes using median-based detection.
  // Sort all body midpoints to find the "normal" price range, then clamp
  // any high/low that extends beyond 3x the inter-quartile range.
  const mids = candles.map((c) => (c.open + c.close) / 2).sort((a, b) => a - b);
  const q1 = mids[Math.floor(mids.length * 0.25)];
  const q3 = mids[Math.floor(mids.length * 0.75)];
  const iqr = q3 - q1;
  const upperFence = q3 + iqr * 3;
  const lowerFence = q1 - iqr * 3;

  let result = candles.map((c) => {
    let { high, low } = c;
    // Clamp extreme wicks that go beyond the fence
    if (high > upperFence) high = Math.max(Math.max(c.open, c.close), upperFence);
    if (low < lowerFence) low = Math.min(Math.min(c.open, c.close), lowerFence);
    // Ensure high >= max(open,close) and low <= min(open,close)
    high = Math.max(high, Math.max(c.open, c.close));
    low = Math.min(low, Math.min(c.open, c.close));
    return high !== c.high || low !== c.low ? { ...c, high, low } : c;
  });

  // Step 2: Ensure visible bodies relative to window price range.
  let windowHigh = -Infinity;
  let windowLow = Infinity;
  for (const c of result) {
    if (c.high > windowHigh) windowHigh = c.high;
    if (c.low < windowLow) windowLow = c.low;
  }
  const windowRange = windowHigh - windowLow;
  if (windowRange <= 0) return result;

  // Minimum body = 0.5% of the window's price range
  // On a 500px chart this is ~2.5px — clearly visible as a colored bar
  const minBody = windowRange * 0.005;

  result = result.map((c) => {
    const body = Math.abs(c.close - c.open);
    if (body >= minBody) return c;

    const nudge = (minBody - body) / 2;
    // Direction: keep original, or random if equal
    const isGreen = c.close > c.open || (c.close === c.open && Math.random() > 0.5);

    let newOpen: number;
    let newClose: number;
    if (isGreen) {
      newOpen = c.open - nudge;
      newClose = c.close + nudge;
    } else {
      newOpen = c.open + nudge;
      newClose = c.close - nudge;
    }

    // Expand high/low if the body now exceeds them
    let newHigh = Math.max(c.high, Math.max(newOpen, newClose));
    let newLow = Math.min(c.low, Math.min(newOpen, newClose));

    return { ...c, open: newOpen, close: newClose, high: newHigh, low: newLow };
  });

  return result;
}

function buildChartData(
  asset: Asset,
  timeframe: TimeFrame,
  candles: Candle[],
  visibleCount?: number,
  hiddenCount?: number,
): ChartData {
  const visible = visibleCount ?? VISIBLE_CANDLES;
  const hidden = hiddenCount ?? HIDDEN_CANDLES;
  const totalNeeded = visible + hidden;

  if (candles.length < totalNeeded) {
    throw new Error(
      `Not enough candles for ${asset.symbol} ${timeframe}: got ${candles.length}, need ${totalNeeded}`,
    );
  }

  // Try up to 5 random windows, pick the first that passes validation
  const safeEnd = Math.max(candles.length - 2, totalNeeded);
  const maxStart = safeEnd - totalNeeded;

  for (let attempt = 0; attempt < 5; attempt++) {
    const startIndex = Math.floor(Math.random() * (maxStart + 1));
    const window = candles.slice(startIndex, startIndex + totalNeeded);

    if (validateWindow(window)) {
      const processed = fixCandleWindow(window);
      return {
        asset,
        timeframe,
        visibleCandles: processed.slice(0, visible),
        hiddenCandles: processed.slice(visible, visible + hidden),
      };
    }
  }

  // Fallback: just use first valid-looking window
  const startIndex = Math.floor(Math.random() * (maxStart + 1));
  const fallbackWindow = candles.slice(startIndex, startIndex + visible + hidden);
  const processed = fixCandleWindow(fallbackWindow);
  return {
    asset,
    timeframe,
    visibleCandles: processed.slice(0, visible),
    hiddenCandles: processed.slice(visible, visible + hidden),
  };
}

export async function pickRandomChart(
  forceAsset?: Asset,
  forceTimeframe?: TimeFrame,
  visibleCount?: number,
  hiddenCount?: number,
): Promise<ChartData> {
  // If no forced asset, try multiple random assets for robustness
  const candidates = forceAsset
    ? [forceAsset]
    : shuffle(ALL_ASSETS).slice(0, 5); // try up to 5 random assets

  for (const asset of candidates) {
    const availableTimeframes = TIMEFRAMES_BY_TYPE[asset.type];
    // Weight toward 1D and 4h for more reliable data
    let timeframe = forceTimeframe ?? weightedPickTimeframe(availableTimeframes);

    // If forced timeframe isn't available for this asset type, pick a valid one
    if (!availableTimeframes.includes(timeframe)) {
      timeframe = pickRandom(availableTimeframes);
    }

    try {
      const candles = await fetchCandles(asset, timeframe);
      return buildChartData(asset, timeframe, candles, visibleCount, hiddenCount);
    } catch (error) {
      console.warn(
        `Failed to fetch ${asset.symbol} ${timeframe}: ${error instanceof Error ? error.message : error}`,
      );
      // Continue to next candidate
    }
  }

  throw new Error("Failed to fetch chart data after multiple attempts");
}

export async function pickChartForAssetAndTimeframe(
  asset: Asset,
  timeframe: TimeFrame,
  visibleCount?: number,
  hiddenCount?: number,
): Promise<ChartData> {
  const candles = await fetchCandles(asset, timeframe);
  return buildChartData(asset, timeframe, candles, visibleCount, hiddenCount);
}
