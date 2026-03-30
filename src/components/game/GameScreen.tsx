"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useChart } from "@/hooks/useChart";
import { useHydration } from "@/hooks/useHydration";
import { calculateTrade } from "@/lib/game/engine";
import { BET_FRACTION, STARTING_BALANCE } from "@/lib/game/constants";
import { calculateEMA } from "@/lib/indicators/ema";
import { calculateRSI } from "@/lib/indicators/rsi";
import { calculateMACD } from "@/lib/indicators/macd";
import { calculateBollinger } from "@/lib/indicators/bollinger";
import type { Direction } from "@/types/trade";
import type { Asset, TimeFrame, IndicatorData } from "@/types/chart";
import { TIMEFRAMES_BY_TYPE } from "@/lib/data/assets";
import { cn } from "@/lib/utils";
import { setSoundEnabled } from "@/lib/sounds";
import { DIFFICULTY_CONFIG } from "@/stores/settings-store";
import ChartReveal from "@/components/chart/ChartReveal";
import ChartSkeleton from "@/components/chart/ChartSkeleton";
import ChartOverlay from "@/components/chart/ChartOverlay";
import SwipeHandler from "@/components/game/SwipeHandler";
import LeverageSelector from "@/components/game/LeverageSelector";
import TradeResult from "@/components/game/TradeResult";
import AssetPicker from "@/components/game/AssetPicker";
import TimeframePicker from "@/components/game/TimeframePicker";
import IndicatorSelector from "@/components/game/IndicatorSelector";
import BetSizeSelector from "@/components/game/BetSizeSelector";

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
    enabledIndicators,
    revealSpeed,
    soundEnabled,
    difficulty,
    betFraction,
    setSelectedAsset,
    setSelectedTimeframe,
    setRevealSpeed,
    setBetFraction,
  } = useSettingsStore();

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [indicatorOpen, setIndicatorOpen] = useState(false);

  // Sync sound setting
  useEffect(() => {
    if (hydrated) setSoundEnabled(soundEnabled);
  }, [hydrated, soundEnabled]);

  // Compute indicator data from all candles
  const { visibleIndicatorData, hiddenIndicatorData } = useMemo(() => {
    if (!chart) return { visibleIndicatorData: undefined, hiddenIndicatorData: undefined };

    const allCandles = [...chart.visibleCandles, ...chart.hiddenCandles];
    const closes = allCandles.map((c) => c.close);
    const splitIdx = chart.visibleCandles.length;

    const visible: IndicatorData = {};
    const hidden: IndicatorData = {};

    if (enabledIndicators.includes("volume")) {
      const volumes = allCandles.map((c) => c.volume ?? null);
      visible.volume = volumes.slice(0, splitIdx);
      hidden.volume = volumes.slice(splitIdx);
    }
    if (enabledIndicators.includes("ema9")) {
      const full = calculateEMA(closes, 9);
      visible.ema9 = full.slice(0, splitIdx);
      hidden.ema9 = full.slice(splitIdx);
    }
    if (enabledIndicators.includes("ema21")) {
      const full = calculateEMA(closes, 21);
      visible.ema21 = full.slice(0, splitIdx);
      hidden.ema21 = full.slice(splitIdx);
    }
    if (enabledIndicators.includes("rsi")) {
      const full = calculateRSI(closes);
      visible.rsi = full.slice(0, splitIdx);
      hidden.rsi = full.slice(splitIdx);
    }
    if (enabledIndicators.includes("macd")) {
      const full = calculateMACD(closes);
      visible.macd = {
        macd: full.macd.slice(0, splitIdx),
        signal: full.signal.slice(0, splitIdx),
        histogram: full.histogram.slice(0, splitIdx),
      };
      hidden.macd = {
        macd: full.macd.slice(splitIdx),
        signal: full.signal.slice(splitIdx),
        histogram: full.histogram.slice(splitIdx),
      };
    }
    if (enabledIndicators.includes("bollinger")) {
      const full = calculateBollinger(closes);
      visible.bollinger = {
        upper: full.upper.slice(0, splitIdx),
        middle: full.middle.slice(0, splitIdx),
        lower: full.lower.slice(0, splitIdx),
      };
      hidden.bollinger = {
        upper: full.upper.slice(splitIdx),
        middle: full.middle.slice(splitIdx),
        lower: full.lower.slice(splitIdx),
      };
    }

    return { visibleIndicatorData: visible, hiddenIndicatorData: hidden };
  }, [chart, enabledIndicators]);

  // Fetch chart with current settings
  const loadChart = useCallback(() => {
    const params: { asset?: string; timeframe?: string; visible?: number; hidden?: number } = {};
    if (hydrated && selectedAsset) params.asset = selectedAsset.symbol;
    if (hydrated && selectedTimeframe) params.timeframe = selectedTimeframe;
    if (hydrated && difficulty) {
      const config = DIFFICULTY_CONFIG[difficulty];
      params.visible = config.visible;
      params.hidden = config.hidden;
    }
    fetchChart(Object.keys(params).length > 0 ? params : undefined);
  }, [fetchChart, selectedAsset, selectedTimeframe, difficulty, hydrated]);

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
    const fraction = betFraction || BET_FRACTION;
    const betAmount = Math.round(balance * fraction * 100) / 100;
    const tradeResult = calculateTrade({ direction, leverage, entryPrice, exitPrice, betAmount });
    setResult(tradeResult);
    onTrade(tradeResult.pnl);
  }, [chart, direction, leverage, balance, betFraction, setResult, onTrade]);

  const handleNext = useCallback(() => {
    reset();
    loadChart();
  }, [reset, loadChart]);

  const handleAssetSelect = useCallback(
    (asset: Asset | null) => {
      setSelectedAsset(asset);
      // Auto-reset timeframe if it's not valid for the new asset type
      let tf = selectedTimeframe;
      if (asset && tf) {
        const validTFs = TIMEFRAMES_BY_TYPE[asset.type];
        if (!validTFs.includes(tf)) {
          tf = null;
          setSelectedTimeframe(null);
        }
      }
      reset();
      setTimeout(() => {
        const params: { asset?: string; timeframe?: string; visible?: number; hidden?: number } = {};
        if (asset) params.asset = asset.symbol;
        if (tf) params.timeframe = tf;
        if (difficulty) {
          const config = DIFFICULTY_CONFIG[difficulty];
          params.visible = config.visible;
          params.hidden = config.hidden;
        }
        fetchChart(Object.keys(params).length > 0 ? params : undefined);
      }, 50);
    },
    [setSelectedAsset, setSelectedTimeframe, selectedTimeframe, difficulty, reset, fetchChart],
  );

  const handleTimeframeChange = useCallback(
    (tf: TimeFrame | null) => {
      setSelectedTimeframe(tf);
      reset();
      setTimeout(() => {
        const params: { asset?: string; timeframe?: string; visible?: number; hidden?: number } = {};
        if (selectedAsset) params.asset = selectedAsset.symbol;
        if (tf) params.timeframe = tf;
        if (difficulty) {
          const config = DIFFICULTY_CONFIG[difficulty];
          params.visible = config.visible;
          params.hidden = config.hidden;
        }
        fetchChart(Object.keys(params).length > 0 ? params : undefined);
      }, 50);
    },
    [setSelectedTimeframe, selectedAsset, difficulty, reset, fetchChart],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (phase === "viewing") {
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "s") {
          e.preventDefault();
          handleSwipe("short");
        } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") {
          e.preventDefault();
          handleSwipe("long");
        }
      } else if (phase === "result") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleSwipe, handleNext]);

  const isBankrupt = hydrated && balance < 100;

  return (
    <div className="flex h-full flex-col">
      {/* Bankruptcy warning */}
      {isBankrupt && phase === "viewing" && (
        <div className="shrink-0 bg-loss/10 border-b border-loss/20 px-4 py-2 text-center">
          <p className="text-xs font-bold text-loss">
            Low balance! Your portfolio is below $100.
          </p>
          <button
            onClick={() => {
              if (confirm(`Reset portfolio to $${STARTING_BALANCE.toLocaleString()}?`)) {
                usePortfolioStore.getState().resetPortfolio();
              }
            }}
            className="mt-1 rounded-md bg-loss/20 px-3 py-1 text-[10px] font-bold text-loss hover:bg-loss/30"
          >
            Reset to ${STARTING_BALANCE.toLocaleString()}
          </button>
        </div>
      )}

      {/* Chart area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase === "loading" && <ChartSkeleton />}

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
              candles={phase === "viewing" ? chart.visibleCandles : undefined}
            />

            {/* Timeframe picker below overlay */}
            {phase === "viewing" && (
              <div className="absolute left-3 top-[3.75rem] z-10">
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
                  enabledIndicators={hydrated ? enabledIndicators : []}
                  visibleIndicatorData={visibleIndicatorData}
                  hiddenIndicatorData={hiddenIndicatorData}
                  revealSpeed={hydrated ? revealSpeed : 1}
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
              <div className="flex items-center gap-2">
                {/* Speed selector */}
                <div className="flex items-center gap-1">
                  {([1, 2, 4] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setRevealSpeed(s)}
                      className={cn(
                        "rounded-md px-1.5 py-1 text-[10px] font-bold transition-all",
                        revealSpeed === s
                          ? "bg-accent text-white"
                          : "bg-surface-tertiary text-text-muted",
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIndicatorOpen(true)}
                  className="rounded-lg bg-surface-tertiary px-3 py-2 text-xs font-bold text-text-muted transition-colors hover:text-text-secondary border border-border"
                >
                  Indicators
                </button>
              </div>
            </div>
            <BetSizeSelector
              balance={balance}
              betFraction={betFraction || 0.1}
              onChange={setBetFraction}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSwipe("short")}
                className="flex-1 rounded-xl border border-loss/20 bg-loss/10 py-3 text-sm font-black text-loss transition-all hover:bg-loss/20 active:scale-[0.98]"
              >
                ← SHORT
                <span className="ml-1 hidden text-[10px] font-normal opacity-50 sm:inline">[S]</span>
              </button>
              <button
                onClick={() => handleSwipe("long")}
                className="flex-1 rounded-xl border border-profit/20 bg-profit/10 py-3 text-sm font-black text-profit transition-all hover:bg-profit/20 active:scale-[0.98]"
              >
                LONG →
                <span className="ml-1 hidden text-[10px] font-normal opacity-50 sm:inline">[L]</span>
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
              Tap &quot;Next Trade&quot; or press Space to continue
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
