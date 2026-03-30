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
      return {
        asset,
        timeframe,
        visibleCandles: window.slice(0, visible),
        hiddenCandles: window.slice(visible, visible + hidden),
      };
    }
  }

  // Fallback: just use first valid-looking window
  const startIndex = Math.floor(Math.random() * (maxStart + 1));
  return {
    asset,
    timeframe,
    visibleCandles: candles.slice(startIndex, startIndex + visible),
    hiddenCandles: candles.slice(
      startIndex + visible,
      startIndex + visible + hidden,
    ),
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
