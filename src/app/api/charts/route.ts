import { NextResponse } from "next/server";
import { pickRandomChart, pickChartForAssetAndTimeframe } from "@/lib/data/chart-picker";
import { ALL_ASSETS, TIMEFRAMES_BY_TYPE } from "@/lib/data/assets";
import type { TimeFrame } from "@/types/chart";

export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const VALID_TIMEFRAMES: TimeFrame[] = ["1m", "5m", "15m", "1h", "4h", "1D"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetSymbol = searchParams.get("asset");
  const timeframe = searchParams.get("timeframe") as TimeFrame | null;

  if (timeframe && !VALID_TIMEFRAMES.includes(timeframe)) {
    return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 });
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const asset = assetSymbol
        ? ALL_ASSETS.find((a) => a.symbol === assetSymbol)
        : undefined;

      if (assetSymbol && !asset) {
        return NextResponse.json({ error: "Unknown asset" }, { status: 400 });
      }

      if (asset && timeframe) {
        const chart = await pickChartForAssetAndTimeframe(asset, timeframe);
        return NextResponse.json(chart);
      } else if (asset) {
        const tfs = TIMEFRAMES_BY_TYPE[asset.type];
        const chart = await pickChartForAssetAndTimeframe(asset, pickRandom(tfs));
        return NextResponse.json(chart);
      } else if (timeframe) {
        const chart = await pickRandomChart(undefined, timeframe);
        return NextResponse.json(chart);
      }

      const chart = await pickRandomChart();
      return NextResponse.json(chart);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Chart fetch attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  return NextResponse.json(
    { error: lastError?.message ?? "Failed to fetch chart data" },
    { status: 500 },
  );
}
