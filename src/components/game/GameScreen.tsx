"use client";

import { useCallback, useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { useChart } from "@/hooks/useChart";
import { calculateTrade } from "@/lib/game/engine";
import { BET_FRACTION, STARTING_BALANCE } from "@/lib/game/constants";
import type { Direction } from "@/types/trade";
import ChartReveal from "@/components/chart/ChartReveal";
import ChartOverlay from "@/components/chart/ChartOverlay";
import SwipeHandler from "@/components/game/SwipeHandler";
import LeverageSelector from "@/components/game/LeverageSelector";
import TradeResult from "@/components/game/TradeResult";

interface GameScreenProps {
  balance: number;
  onTrade: (pnl: number) => void;
}

export default function GameScreen({ balance, onTrade }: GameScreenProps) {
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

  // Load initial chart
  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  // When chart data arrives, update game store
  useEffect(() => {
    if (chartData && !loading) {
      setChart(chartData);
    }
  }, [chartData, loading, setChart]);

  // When loading, set loading phase
  useEffect(() => {
    if (loading) {
      setLoading();
    }
  }, [loading, setLoading]);

  // After swipe, start reveal
  useEffect(() => {
    if (phase === "swiped") {
      const timer = setTimeout(() => {
        setRevealing();
      }, 300);
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

    const tradeResult = calculateTrade({
      direction,
      leverage,
      entryPrice,
      exitPrice,
      betAmount,
    });

    setResult(tradeResult);
    onTrade(tradeResult.pnl);
  }, [chart, direction, leverage, balance, setResult, onTrade]);

  const handleNext = useCallback(() => {
    reset();
    fetchChart();
  }, [reset, fetchChart]);

  const handleButtonTrade = useCallback(
    (dir: Direction) => {
      if (phase !== "viewing") return;
      submitSwipe(dir);
    },
    [phase, submitSwipe],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Chart area */}
      <div className="relative flex-1">
        {phase === "loading" && (
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
                onClick={handleNext}
                className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {chart && phase !== "loading" && (
          <>
            <ChartOverlay asset={chart.asset} timeframe={chart.timeframe} />

            <SwipeHandler
              enabled={phase === "viewing"}
              onSwipe={handleSwipe}
            >
              <div className="h-full px-2 pt-10 pb-4">
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

            {/* Result overlay */}
            {phase === "result" && result && (
              <TradeResult
                result={result}
                balance={balance}
                onNext={handleNext}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="border-t border-border px-4 py-3">
        {phase === "viewing" && (
          <div className="flex flex-col gap-3">
            <LeverageSelector
              value={leverage}
              onChange={setLeverage}
              disabled={phase !== "viewing"}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleButtonTrade("short")}
                className="flex-1 rounded-xl bg-loss/10 py-3 text-sm font-bold text-loss transition-colors hover:bg-loss/20 active:bg-loss/30"
              >
                SHORT
              </button>
              <button
                onClick={() => handleButtonTrade("long")}
                className="flex-1 rounded-xl bg-profit/10 py-3 text-sm font-bold text-profit transition-colors hover:bg-profit/20 active:bg-profit/30"
              >
                LONG
              </button>
            </div>
            <p className="text-center text-xs text-text-muted">
              Swipe or tap to trade
            </p>
          </div>
        )}

        {(phase === "swiped" || phase === "revealing") && (
          <div className="flex items-center justify-center py-3">
            <p className="text-sm text-text-secondary">
              {phase === "swiped" ? "Revealing..." : "Watching the market..."}
            </p>
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
    </div>
  );
}
