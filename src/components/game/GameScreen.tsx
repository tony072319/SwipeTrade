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
import { calculateSMA } from "@/lib/indicators/sma";
import { calculateRSI } from "@/lib/indicators/rsi";
import { calculateMACD } from "@/lib/indicators/macd";
import { calculateBollinger } from "@/lib/indicators/bollinger";
import { calculateVWAP } from "@/lib/indicators/vwap";
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
import { ConfidenceRating, logConfidence, CONFIDENCE_MULTIPLIER } from "@/components/game/ConfidenceRating";

interface GameScreenProps {
  balance: number;
  onTrade: (pnl: number) => void;
}

export default function GameScreen({ balance, onTrade }: GameScreenProps) {
  const hydrated = useHydration();
  const { chart: chartData, loading, error, fetchChart, prefetchNext } = useChart();
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
  const [confidence, setConfidence] = useState(2);
  const [reviewingChart, setReviewingChart] = useState(false);

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
    if (enabledIndicators.includes("vwap")) {
      const highs = allCandles.map((c) => c.high);
      const lows = allCandles.map((c) => c.low);
      const volumes = allCandles.map((c) => c.volume ?? null);
      const full = calculateVWAP(highs, lows, closes, volumes);
      visible.vwap = full.slice(0, splitIdx);
      hidden.vwap = full.slice(splitIdx);
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
    if (enabledIndicators.includes("sma50")) {
      const full = calculateSMA(closes, 50);
      visible.sma50 = full.slice(0, splitIdx);
      hidden.sma50 = full.slice(splitIdx);
    }
    if (enabledIndicators.includes("sma200")) {
      const full = calculateSMA(closes, 200);
      visible.sma200 = full.slice(0, splitIdx);
      hidden.sma200 = full.slice(splitIdx);
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
      // Start prefetching next chart while revealing
      prefetchNext();
      return () => clearTimeout(timer);
    }
  }, [phase, setRevealing, prefetchNext]);

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
    const confMultiplier = CONFIDENCE_MULTIPLIER[confidence] ?? 1;
    const betAmount = Math.round(balance * fraction * confMultiplier * 100) / 100;
    const tradeResult = calculateTrade({ direction, leverage, entryPrice, exitPrice, betAmount });
    setResult(tradeResult);
    onTrade(tradeResult.pnl);
    logConfidence(confidence, tradeResult.isWin);
  }, [chart, direction, leverage, balance, betFraction, confidence, setResult, onTrade]);

  const handleNext = useCallback(() => {
    reset();
    setConfidence(2);
    setReviewingChart(false);
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
              <div className="absolute left-3 top-[3.25rem] z-10">
                <TimeframePicker
                  value={hydrated ? selectedTimeframe : null}
                  onChange={handleTimeframeChange}
                  assetType={chart.asset.type}
                />
              </div>
            )}

            <SwipeHandler enabled={phase === "viewing"} onSwipe={handleSwipe}>
              <div className="h-full px-1 pt-[3.75rem] pb-1">
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

            {phase === "result" && result && !reviewingChart && (
              <TradeResult
                result={result}
                balance={balance}
                onNext={handleNext}
                onReviewChart={() => setReviewingChart(true)}
              />
            )}

            {/* Review chart overlay — back button to return to result */}
            {phase === "result" && reviewingChart && (
              <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
                <button
                  onClick={() => setReviewingChart(false)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface-secondary/95 px-5 py-3 text-sm font-bold text-text-primary shadow-2xl backdrop-blur-md transition-all hover:bg-surface-secondary active:scale-[0.98]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Result
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls — compact layout to ensure buttons are always visible */}
      <div className="shrink-0 border-t border-border bg-surface-secondary/30 px-3 py-2">
        {phase === "viewing" && (
          <div className="flex flex-col gap-2">
            {/* Row 1: Leverage + Bet + Confidence + Speed + Indicators */}
            <div className="flex items-center gap-2">
              <LeverageSelector
                value={leverage}
                onChange={setLeverage}
                disabled={phase !== "viewing"}
              />
              <div className="h-4 w-px bg-border" />
              <BetSizeSelector
                balance={balance}
                betFraction={betFraction || 0.1}
                leverage={leverage}
                onChange={setBetFraction}
              />
              <div className="h-4 w-px bg-border" />
              <ConfidenceRating value={confidence} onRate={setConfidence} />
              <div className="ml-auto flex items-center gap-1">
                {([1, 2, 4] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setRevealSpeed(s)}
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px] font-bold transition-all",
                      revealSpeed === s
                        ? "bg-accent text-white"
                        : "bg-surface-tertiary text-text-muted",
                    )}
                  >
                    {s}x
                  </button>
                ))}
                <button
                  onClick={() => setIndicatorOpen(true)}
                  className="ml-1 rounded-md bg-surface-tertiary px-2 py-1 text-[9px] font-bold text-text-muted transition-colors hover:text-text-secondary border border-border"
                >
                  Ind.
                </button>
              </div>
            </div>

            {/* Row 2: Position summary */}
            {chart && (
              <div className="flex items-center justify-between text-[9px] text-text-muted font-mono px-1">
                <span>
                  <span className="text-text-secondary font-bold">{chart.asset.symbol}</span>
                  {" "}@ ${chart.visibleCandles[chart.visibleCandles.length - 1].close >= 1
                    ? chart.visibleCandles[chart.visibleCandles.length - 1].close.toFixed(2)
                    : chart.visibleCandles[chart.visibleCandles.length - 1].close.toFixed(6)}
                </span>
                <span>
                  Position: <span className="font-bold text-accent">
                    ${Math.round(balance * (betFraction || 0.1) * (CONFIDENCE_MULTIPLIER[confidence] ?? 1)).toLocaleString()}
                  </span>
                  {leverage > 1 && <span> ({leverage}x)</span>}
                </span>
              </div>
            )}

            {/* Row 3: BUY/SELL buttons — always visible */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSwipe("short")}
                aria-label="Short - bet price goes down"
                className="flex-1 rounded-xl border-2 border-loss/30 bg-gradient-to-b from-loss/10 to-loss/5 py-3 text-sm font-black text-loss transition-all hover:border-loss/50 hover:from-loss/20 hover:to-loss/10 active:scale-[0.97]"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/></svg>
                  SELL SHORT
                  <span className="text-[8px] font-normal opacity-40 hidden sm:inline">[S]</span>
                </span>
              </button>
              <button
                onClick={() => handleSwipe("long")}
                aria-label="Long - bet price goes up"
                className="flex-1 rounded-xl border-2 border-profit/30 bg-gradient-to-b from-profit/10 to-profit/5 py-3 text-sm font-black text-profit transition-all hover:border-profit/50 hover:from-profit/20 hover:to-profit/10 active:scale-[0.97]"
              >
                <span className="flex items-center justify-center gap-1.5">
                  BUY LONG
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/></svg>
                  <span className="text-[8px] font-normal opacity-40 hidden sm:inline">[L]</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {(phase === "swiped" || phase === "revealing") && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-black uppercase",
                direction === "long" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss",
              )}>
                {direction === "long" ? "BUY" : "SELL"}
              </span>
              <span className="text-xs font-bold text-text-primary">{chart?.asset.symbol}</span>
              <span className="text-[10px] font-mono text-text-muted">{leverage}x</span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-[9px] text-text-muted ml-1">
                {phase === "swiped" ? "Submitting..." : "Revealing..."}
              </span>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="py-2 text-center">
            <p className="text-[10px] text-text-muted">
              Tap &quot;Next Trade&quot; or press Space
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
