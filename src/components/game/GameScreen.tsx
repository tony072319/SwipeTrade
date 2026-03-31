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
    phase, chart, direction, leverage, result,
    setChart, setLoading, submitSwipe, setRevealing, setResult, setLeverage, reset,
  } = useGameStore();

  const {
    selectedAsset, selectedTimeframe, enabledIndicators, revealSpeed,
    soundEnabled, difficulty, betFraction,
    setSelectedAsset, setSelectedTimeframe, setRevealSpeed, setBetFraction,
  } = useSettingsStore();

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [indicatorOpen, setIndicatorOpen] = useState(false);
  const [confidence, setConfidence] = useState(2);
  // After trade result, show chart review instead of immediately loading next
  const [showingResult, setShowingResult] = useState(true);

  useEffect(() => {
    if (hydrated) setSoundEnabled(soundEnabled);
  }, [hydrated, soundEnabled]);

  // Compute indicator data
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
    if (enabledIndicators.includes("ema9")) { const f = calculateEMA(closes, 9); visible.ema9 = f.slice(0, splitIdx); hidden.ema9 = f.slice(splitIdx); }
    if (enabledIndicators.includes("ema21")) { const f = calculateEMA(closes, 21); visible.ema21 = f.slice(0, splitIdx); hidden.ema21 = f.slice(splitIdx); }
    if (enabledIndicators.includes("sma50")) { const f = calculateSMA(closes, 50); visible.sma50 = f.slice(0, splitIdx); hidden.sma50 = f.slice(splitIdx); }
    if (enabledIndicators.includes("sma200")) { const f = calculateSMA(closes, 200); visible.sma200 = f.slice(0, splitIdx); hidden.sma200 = f.slice(splitIdx); }
    if (enabledIndicators.includes("rsi")) { const f = calculateRSI(closes); visible.rsi = f.slice(0, splitIdx); hidden.rsi = f.slice(splitIdx); }
    if (enabledIndicators.includes("macd")) {
      const f = calculateMACD(closes);
      visible.macd = { macd: f.macd.slice(0, splitIdx), signal: f.signal.slice(0, splitIdx), histogram: f.histogram.slice(0, splitIdx) };
      hidden.macd = { macd: f.macd.slice(splitIdx), signal: f.signal.slice(splitIdx), histogram: f.histogram.slice(splitIdx) };
    }
    if (enabledIndicators.includes("bollinger")) {
      const f = calculateBollinger(closes);
      visible.bollinger = { upper: f.upper.slice(0, splitIdx), middle: f.middle.slice(0, splitIdx), lower: f.lower.slice(0, splitIdx) };
      hidden.bollinger = { upper: f.upper.slice(splitIdx), middle: f.middle.slice(splitIdx), lower: f.lower.slice(splitIdx) };
    }
    return { visibleIndicatorData: visible, hiddenIndicatorData: hidden };
  }, [chart, enabledIndicators]);

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

  useEffect(() => { loadChart(); }, [loadChart]);
  useEffect(() => { if (chartData && !loading) setChart(chartData); }, [chartData, loading, setChart]);
  useEffect(() => { if (loading) setLoading(); }, [loading, setLoading]);

  useEffect(() => {
    if (phase === "swiped") {
      const timer = setTimeout(() => setRevealing(), 200);
      prefetchNext();
      return () => clearTimeout(timer);
    }
  }, [phase, setRevealing, prefetchNext]);

  const handleSwipe = useCallback((dir: Direction) => {
    if (phase !== "viewing") return;
    submitSwipe(dir);
  }, [phase, submitSwipe]);

  const handleRevealComplete = useCallback(() => {
    if (!chart || !direction) return;
    const entryPrice = chart.visibleCandles[chart.visibleCandles.length - 1].close;
    const exitPrice = chart.hiddenCandles[chart.hiddenCandles.length - 1].close;
    const fraction = betFraction || BET_FRACTION;
    const confMultiplier = CONFIDENCE_MULTIPLIER[confidence] ?? 1;
    const betAmount = Math.round(balance * fraction * confMultiplier * 100) / 100;
    const tradeResult = calculateTrade({ direction, leverage, entryPrice, exitPrice, betAmount });
    setResult(tradeResult);
    setShowingResult(true);
    onTrade(tradeResult.pnl);
    logConfidence(confidence, tradeResult.isWin);
  }, [chart, direction, leverage, balance, betFraction, confidence, setResult, onTrade]);

  const handleNext = useCallback(() => {
    reset();
    setConfidence(2);
    setShowingResult(true);
    loadChart();
  }, [reset, loadChart]);

  const handleAssetSelect = useCallback((asset: Asset | null) => {
    setSelectedAsset(asset);
    let tf = selectedTimeframe;
    if (asset && tf) {
      const validTFs = TIMEFRAMES_BY_TYPE[asset.type];
      if (!validTFs.includes(tf)) { tf = null; setSelectedTimeframe(null); }
    }
    reset();
    setTimeout(() => {
      const params: { asset?: string; timeframe?: string; visible?: number; hidden?: number } = {};
      if (asset) params.asset = asset.symbol;
      if (tf) params.timeframe = tf;
      if (difficulty) { const config = DIFFICULTY_CONFIG[difficulty]; params.visible = config.visible; params.hidden = config.hidden; }
      fetchChart(Object.keys(params).length > 0 ? params : undefined);
    }, 50);
  }, [setSelectedAsset, setSelectedTimeframe, selectedTimeframe, difficulty, reset, fetchChart]);

  const handleTimeframeChange = useCallback((tf: TimeFrame | null) => {
    setSelectedTimeframe(tf);
    reset();
    setTimeout(() => {
      const params: { asset?: string; timeframe?: string; visible?: number; hidden?: number } = {};
      if (selectedAsset) params.asset = selectedAsset.symbol;
      if (tf) params.timeframe = tf;
      if (difficulty) { const config = DIFFICULTY_CONFIG[difficulty]; params.visible = config.visible; params.hidden = config.hidden; }
      fetchChart(Object.keys(params).length > 0 ? params : undefined);
    }, 50);
  }, [setSelectedTimeframe, selectedAsset, difficulty, reset, fetchChart]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === "viewing") {
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "s") { e.preventDefault(); handleSwipe("short"); }
        else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") { e.preventDefault(); handleSwipe("long"); }
      } else if (phase === "result") {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleNext(); }
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
        <div className="shrink-0 bg-loss/10 border-b border-loss/20 px-4 py-1.5 text-center">
          <p className="text-[10px] font-bold text-loss">
            Low balance!{" "}
            <button
              onClick={() => { if (confirm(`Reset to $${STARTING_BALANCE.toLocaleString()}?`)) usePortfolioStore.getState().resetPortfolio(); }}
              className="underline hover:no-underline"
            >Reset</button>
          </p>
        </div>
      )}

      {/* Chart area — takes all available space */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase === "loading" && <ChartSkeleton />}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <p className="text-sm text-loss">{error}</p>
              <button onClick={handleNext} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white">
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

            {phase === "viewing" && (
              <div className="absolute left-3 top-[2.75rem] z-10">
                <TimeframePicker
                  value={hydrated ? selectedTimeframe : null}
                  onChange={handleTimeframeChange}
                  assetType={chart.asset.type}
                />
              </div>
            )}

            <SwipeHandler enabled={phase === "viewing"} onSwipe={handleSwipe}>
              <div className="h-full px-1 pt-14 pb-1">
                <ChartReveal
                  visibleCandles={chart.visibleCandles}
                  hiddenCandles={chart.hiddenCandles}
                  revealing={phase === "revealing"}
                  onRevealComplete={handleRevealComplete}
                  entryPrice={direction ? chart.visibleCandles[chart.visibleCandles.length - 1].close : undefined}
                  enabledIndicators={hydrated ? enabledIndicators : []}
                  visibleIndicatorData={visibleIndicatorData}
                  hiddenIndicatorData={hiddenIndicatorData}
                  revealSpeed={hydrated ? revealSpeed : 1}
                />
              </div>
            </SwipeHandler>

            {/* Trade result overlay — can be dismissed to review chart */}
            {phase === "result" && result && showingResult && (
              <TradeResult
                result={result}
                balance={balance}
                onNext={handleNext}
                onReviewChart={() => setShowingResult(false)}
              />
            )}

            {/* When reviewing chart after result, show floating buttons */}
            {phase === "result" && !showingResult && (
              <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={() => setShowingResult(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary/95 px-4 py-2.5 text-sm font-bold text-text-primary shadow-2xl backdrop-blur-md transition-all hover:bg-surface-secondary active:scale-[0.98]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Result
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-2xl transition-all hover:bg-accent/90 active:scale-[0.98]"
                >
                  Next Trade
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls — minimal height */}
      <div className="shrink-0 border-t border-border bg-surface-secondary/30 px-3 py-2">
        {phase === "viewing" && (
          <div className="flex flex-col gap-1.5">
            {/* Row 1: Leverage + Bet + Conf + Speed + Indicators */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <LeverageSelector value={leverage} onChange={setLeverage} disabled={phase !== "viewing"} />
              <div className="h-4 w-px bg-border/50" />
              <BetSizeSelector balance={balance} betFraction={betFraction || 0.1} leverage={leverage} onChange={setBetFraction} />
              <div className="h-4 w-px bg-border/50" />
              <ConfidenceRating value={confidence} onRate={setConfidence} />
              <div className="ml-auto flex items-center gap-1">
                {([1, 2, 4] as const).map((s) => (
                  <button key={s} onClick={() => setRevealSpeed(s)}
                    className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", revealSpeed === s ? "bg-accent text-white" : "bg-surface-tertiary text-text-muted")}
                  >{s}x</button>
                ))}
                <button onClick={() => setIndicatorOpen(true)}
                  className="ml-0.5 rounded bg-surface-tertiary px-1.5 py-0.5 text-[9px] font-bold text-text-muted border border-border hover:text-text-secondary"
                >Ind</button>
              </div>
            </div>

            {/* Row 2: BUY/SELL buttons — THE most important row */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSwipe("short")}
                className="flex-1 rounded-xl border-2 border-loss/30 bg-loss/10 py-3 text-sm font-black text-loss transition-all hover:bg-loss/20 active:scale-[0.97]"
              >
                ↓ SELL SHORT <span className="text-[8px] font-normal opacity-40">[S]</span>
              </button>
              <button
                onClick={() => handleSwipe("long")}
                className="flex-1 rounded-xl border-2 border-profit/30 bg-profit/10 py-3 text-sm font-black text-profit transition-all hover:bg-profit/20 active:scale-[0.97]"
              >
                BUY LONG ↑ <span className="text-[8px] font-normal opacity-40">[L]</span>
              </button>
            </div>
          </div>
        )}

        {(phase === "swiped" || phase === "revealing") && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase",
              direction === "long" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
            )}>{direction === "long" ? "BUY" : "SELL"}</span>
            <span className="text-xs font-bold">{chart?.asset.symbol}</span>
            <span className="text-[10px] text-text-muted">{leverage}x</span>
            <div className="flex gap-0.5 ml-1">
              {[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{animationDelay:`${i*0.2}s`}} />)}
            </div>
            <span className="text-[9px] text-text-muted">{phase === "swiped" ? "Submitting..." : "Revealing..."}</span>
          </div>
        )}

        {phase === "result" && (
          <div className="py-1.5 text-center">
            <p className="text-[10px] text-text-muted">Press Space for next trade</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetPicker open={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} onSelect={handleAssetSelect} selectedAsset={hydrated ? selectedAsset : null} />
      <IndicatorSelector open={indicatorOpen} onClose={() => setIndicatorOpen(false)} />
    </div>
  );
}
