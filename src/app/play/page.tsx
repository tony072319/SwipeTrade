"use client";

import { useEffect } from "react";
import { useChart } from "@/hooks/useChart";
import CandlestickChart from "@/components/chart/CandlestickChart";
import ChartOverlay from "@/components/chart/ChartOverlay";

export default function PlayPage() {
  const { chart, loading, error, fetchChart } = useChart();

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">SwipeTrade</h1>
        <span className="text-sm text-text-secondary">Practice</span>
      </div>

      {/* Chart area */}
      <div className="relative flex-1">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-text-primary" />
              <p className="text-sm text-text-secondary">Loading chart...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <p className="text-sm text-loss">{error}</p>
              <button
                onClick={fetchChart}
                className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {chart && !loading && (
          <>
            <ChartOverlay asset={chart.asset} timeframe={chart.timeframe} />
            <div className="h-full px-2 pt-10 pb-4">
              <CandlestickChart candles={chart.visibleCandles} />
            </div>
          </>
        )}
      </div>

      {/* Bottom hint */}
      {chart && !loading && (
        <div className="border-t border-border px-4 py-4 text-center">
          <p className="text-sm text-text-secondary">
            Swipe right to go{" "}
            <span className="font-semibold text-profit">Long</span> or left to
            go <span className="font-semibold text-loss">Short</span>
          </p>
          <button
            onClick={fetchChart}
            className="mt-3 rounded-lg bg-surface-secondary px-4 py-2 text-sm font-medium text-text-primary"
          >
            Load New Chart
          </button>
        </div>
      )}
    </main>
  );
}
