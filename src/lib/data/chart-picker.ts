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

export async function pickRandomChart(): Promise<ChartData> {
  const asset = pickRandom(ALL_ASSETS);
  const availableTimeframes = TIMEFRAMES_BY_TYPE[asset.type];
  const timeframe = pickRandom(availableTimeframes);

  const totalNeeded = VISIBLE_CANDLES + HIDDEN_CANDLES;
  const candles = await fetchCandles(asset, timeframe);

  if (candles.length < totalNeeded) {
    throw new Error(
      `Not enough candles for ${asset.symbol} ${timeframe}: got ${candles.length}, need ${totalNeeded}`,
    );
  }

  // Pick a random starting point (not too close to the end)
  const maxStart = candles.length - totalNeeded;
  const startIndex = Math.floor(Math.random() * (maxStart + 1));

  const visibleCandles = candles.slice(startIndex, startIndex + VISIBLE_CANDLES);
  const hiddenCandles = candles.slice(
    startIndex + VISIBLE_CANDLES,
    startIndex + VISIBLE_CANDLES + HIDDEN_CANDLES,
  );

  return {
    asset,
    timeframe,
    visibleCandles,
    hiddenCandles,
  };
}

export async function pickChartForAssetAndTimeframe(
  asset: Asset,
  timeframe: TimeFrame,
): Promise<ChartData> {
  const totalNeeded = VISIBLE_CANDLES + HIDDEN_CANDLES;
  const candles = await fetchCandles(asset, timeframe);

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
    visibleCandles: candles.slice(startIndex, startIndex + VISIBLE_CANDLES),
    hiddenCandles: candles.slice(
      startIndex + VISIBLE_CANDLES,
      startIndex + VISIBLE_CANDLES + HIDDEN_CANDLES,
    ),
  };
}
