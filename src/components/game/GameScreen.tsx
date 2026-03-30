"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useChart } from "@/hooks/useChart";
import { useHydration } from "@/hooks/useHydration";
import { calculateTrade } from "@/lib/game/engine";
import { BET_FRACTION } from "@/lib/game/constants";
import type { Direction } from "@/types/trade";
import type { Asset, TimeFrame } from "@/types/chart";
import ChartReveal from "@/components/chart/ChartReveal";
import ChartOverlay from "@/components/chart/ChartOverlay";
import SwipeHandler from "@/components/game/SwipeHandler";
import LeverageSelector from "@/components/game/LeverageSelector";
import TradeResult from "@/components/game/TradeResult";
import AssetPicker from "@/components/game/AssetPicker";
import TimeframePicker from "@/components/game/TimeframePicker";
import IndicatorSelector from "@/components/game/IndicatorSelector";

interface GameScreenProps {
  balance: number;
  onTrade: (pnl: number) => void;
}

export default function GameScreen({ balance, onTrade }: GameScreenProps) {
  const hydrated = useHydration();
  const { chart: chartData, loading, error, fetchChart } = useChart();
  const {
    phase,
    chart,
    direction,
    leverage,
    result,
    setChart,
    setLoading,
    submitSwipe,
    setRevealing,
    setResult,
    setLeverage,
    reset,
  } = useGameStore();

  const {
    selectedAsset,
    selectedTimeframe,
    setSelectedAsset,
    setSelectedTimeframe,
  } = useSettingsStore();

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [indicatorOpen, setIndicatorOpen] = useState(false);

  // Fetch chart with current settings
  const loadChart = useCallback(() => {
    const params: { asset?: string; timeframe?: string } = {};
    if (hydrated && selectedAsset) params.asset = selectedAsset.symbol;
    if (hydrated && selectedTimeframe) params.timeframe = selectedTimeframe;
    fetchChart(Object.keys(params).length > 0 ? params : undefined);
  }, [fetchChart, selectedAsset, selectedTimeframe, hydrated]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    if (chartData && !loading) setChart(chartData);
  }, [chartData, loading, setChart]);

  useEffect(() => {
    if (loading) setLoading();
  }, [loading, setLoading]);

  useEffect(() => {
    if (phase === "swiped") {
      const timer = setTimeout(() => setRevealing(), 200);
      return () => clearTimeout(timer);
    }
  }, [phase, setRevealing]);

  const handleSwipe = useCallback(
    (dir: Direction) => {
      if (phase !== "viewing") return;
      submitSwipe(dir);
    },
    [phase, submitSwipe],
  );

  const handleRevealComplete = useCallback(() => {
    if (!chart || !direction) return;
    const entryPrice = chart.visibleCandles[chart.visibleCandles.length - 1].close;
    const exitPrice = chart.hiddenCandles[chart.hiddenCandles.length - 1].close;
    const betAmount = Math.round(balance * BET_FRACTION * 100) / 100;
    const tradeResult = calculateTrade({ direction, leverage, entryPrice, exitPrice, betAmount });
    setResult(tradeResult);
    onTrade(tradeResult.pnl);
  }, [chart, direction, leverage, balance, setResult, onTrade]);

  const handleNext = useCallback(() => {
    reset();
    loadChart();
  }, [reset, loadChart]);

  const handleAssetSelect = useCallback(
    (asset: Asset | null) => {
      setSelectedAsset(asset);
      // Reset timeframe if new asset type doesn't support current timeframe
      reset();
      setTimeout(() => {
        const params: { asset?: string; timeframe?: string } = {};
        if (asset) params.asset = asset.symbol;
        if (selectedTimeframe) params.timeframe = selectedTimeframe;
        fetchChart(Object.keys(params).length > 0 ? params : undefined);
      }, 50);
    },
    [setSelectedAsset, selectedTimeframe, reset, fetchChart],
  );

  const handleTimeframeChange = useCallback(
    (tf: TimeFrame | null) => {
      setSelectedTimeframe(tf);
      reset();
      setTimeout(() => {
        const params: { asset?: string; timeframe?: string } = {};
        if (selectedAsset) params.asset = selectedAsset.symbol;
        if (tf) params.timeframe = tf;
        fetchChart(Object.keys(params).length > 0 ? params : undefined);
      }, 50);
    },
    [setSelectedTimeframe, selectedAsset, reset, fetchChart],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Chart area */}
      <div className="relative flex-1">
        {phase === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
              <p className="text-sm text-text-muted">Loading chart...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <p className="text-sm text-loss">{error}</p>
              <button
                onClick={handleNext}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {chart && phase !== "loading" && (
          <>
            <ChartOverlay
              asset={chart.asset}
              timeframe={chart.timeframe}
              onAssetClick={() => setAssetPickerOpen(true)}
            />

            {/* Timeframe picker below overlay */}
            {phase === "viewing" && (
              <div className="absolute left-3 top-11 z-10">
                <TimeframePicker
                  value={hydrated ? selectedTimeframe : null}
                  onChange={handleTimeframeChange}
                  assetType={chart.asset.type}
                />
              </div>
            )}

            <SwipeHandler enabled={phase === "viewing"} onSwipe={handleSwipe}>
              <div className="h-full px-1 pt-[4.5rem] pb-2">
                <ChartReveal
                  visibleCandles={chart.visibleCandles}
                  hiddenCandles={chart.hiddenCandles}
                  revealing={phase === "revealing"}
                  onRevealComplete={handleRevealComplete}
                  entryPrice={
                    direction
                      ? chart.visibleCandles[chart.visibleCandles.length - 1].close
                      : undefined
                  }
                />
              </div>
            </SwipeHandler>

            {phase === "result" && result && (
              <TradeResult result={result} balance={balance} onNext={handleNext} />
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="border-t border-border bg-surface-secondary/30 px-4 py-3">
        {phase === "viewing" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <LeverageSelector
                value={leverage}
                onChange={setLeverage}
                disabled={phase !== "viewing"}
              />
              <button
                onClick={() => setIndicatorOpen(true)}
                className="rounded-lg bg-surface-tertiary px-2.5 py-1.5 text-[10px] font-bold text-text-muted transition-colors hover:text-text-secondary border border-border"
              >
                📊 Indicators
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSwipe("short")}
                className="flex-1 rounded-xl border border-loss/20 bg-loss/10 py-3 text-sm font-black text-loss transition-all hover:bg-loss/20 active:scale-[0.98]"
              >
                ← SHORT
              </button>
              <button
                onClick={() => handleSwipe("long")}
                className="flex-1 rounded-xl border border-profit/20 bg-profit/10 py-3 text-sm font-black text-profit transition-all hover:bg-profit/20 active:scale-[0.98]"
              >
                LONG →
              </button>
            </div>
          </div>
        )}

        {(phase === "swiped" || phase === "revealing") && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <p className="text-sm font-medium text-text-secondary">
                Revealing candles...
              </p>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="py-3 text-center">
            <p className="text-xs text-text-muted">
              Tap &quot;Next Trade&quot; to continue
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetPicker
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={handleAssetSelect}
        selectedAsset={hydrated ? selectedAsset : null}
      />
      <IndicatorSelector
        open={indicatorOpen}
        onClose={() => setIndicatorOpen(false)}
      />
    </div>
  );
}
