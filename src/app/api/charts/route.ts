import { NextResponse } from "next/server";
import { pickRandomChart } from "@/lib/data/chart-picker";

export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;

export async function GET() {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const chart = await pickRandomChart();
      return NextResponse.json(chart);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Chart fetch attempt ${attempt + 1} failed: ${lastError.message}`,
      );
    }
  }

  return NextResponse.json(
    { error: lastError?.message ?? "Failed to fetch chart data" },
    { status: 500 },
  );
}
