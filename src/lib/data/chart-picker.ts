import type { Asset, TimeFrame, ChartData, Candle } from "@/types/chart";
import { ALL_ASSETS, TIMEFRAMES_BY_TYPE } from "./assets";
import { fetchYahooOHLCV } from "./yahoo";
import { fetchCoinGeckoOHLCV } from "./coingecko";
import { VISIBLE_CANDLES, HIDDEN_CANDLES } from "@/lib/game/constants";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

  const maxStart = candles.length - totalNeeded;
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
  const asset = forceAsset ?? pickRandom(ALL_ASSETS);
  const availableTimeframes = TIMEFRAMES_BY_TYPE[asset.type];

  let timeframe = forceTimeframe ?? pickRandom(availableTimeframes);

  // If forced timeframe isn't available for this asset type, pick a valid one
  if (!availableTimeframes.includes(timeframe)) {
    timeframe = pickRandom(availableTimeframes);
  }

  const candles = await fetchCandles(asset, timeframe);
  return buildChartData(asset, timeframe, candles, visibleCount, hiddenCount);
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
