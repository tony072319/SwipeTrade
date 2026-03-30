import type { Asset, TimeFrame, ChartData, Candle } from "@/types/chart";
import { ALL_ASSETS, TIMEFRAMES_BY_TYPE } from "./assets";
import { fetchYahooOHLCV } from "./yahoo";
import { fetchCoinGeckoOHLCV } from "./coingecko";
import { VISIBLE_CANDLES, HIDDEN_CANDLES } from "@/lib/game/constants";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

  // Pick a random window, avoiding the very end (might be incomplete candle)
  const safeEnd = Math.max(candles.length - 2, totalNeeded);
  const maxStart = safeEnd - totalNeeded;
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
    let timeframe = forceTimeframe ?? pickRandom(availableTimeframes);

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
