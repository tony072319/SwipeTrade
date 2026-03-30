"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useDailyStore, DAILY_CHALLENGE_COUNT } from "@/stores/daily-store";
import { useHydration } from "@/hooks/useHydration";
import { useGameStore } from "@/stores/game-store";
import { useChart } from "@/hooks/useChart";
import { calculateTrade } from "@/lib/game/engine";
import { formatCurrency, cn } from "@/lib/utils";
import ChartReveal from "@/components/chart/ChartReveal";
import ChartOverlay from "@/components/chart/ChartOverlay";
import SwipeHandler from "@/components/game/SwipeHandler";
import TradeResult from "@/components/game/TradeResult";
import type { Direction } from "@/types/trade";
import CountdownTimer from "@/components/daily/CountdownTimer";

// Deterministic seed-based asset selection for daily challenge
const DAILY_ASSETS = [
  { symbol: "BTC", type: "crypto" as const },
  { symbol: "ETH", type: "crypto" as const },
  { symbol: "AAPL", type: "stock" as const },
  { symbol: "TSLA", type: "stock" as const },
  { symbol: "SOL", type: "crypto" as const },
  { symbol: "GOOGL", type: "stock" as const },
  { symbol: "NVDA", type: "stock" as const },
  { symbol: "BNB", type: "crypto" as const },
  { symbol: "MSFT", type: "stock" as const },
  { symbol: "XRP", type: "crypto" as const },
];

const DAILY_TIMEFRAMES = ["1h", "4h", "1D"] as const;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

// Simple hash to get deterministic index from date + round
function dateHash(date: string, round: number): number {
  let hash = 0;
  const str = `${date}-${round}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function DailyPage() {
  const hydrated = useHydration();
  const today = getTodayString();
  const {
    currentDate,
    currentIndex,
    totalPnl,
    tradesWon,
    completed,
    trades: dailyTrades,
    pastResults,
    startDaily,
    recordDailyTrade,
    completeDaily,
  } = useDailyStore();

  const { chart: chartData, loading, fetchChart } = useChart();
  const {
    phase,
    chart,
    direction,
    result,
    setChart,
    setLoading,
    submitSwipe,
    setRevealing,
    setResult,
    reset,
  } = useGameStore();

  const [started, setStarted] = useState(false);
  const [balance] = useState(10000); // Fixed balance for daily

  const isCompletedToday = hydrated && currentDate === today && completed;
  const isInProgress = hydrated && currentDate === today && !completed && currentIndex > 0;

  // Get the asset/timeframe for current round
  const roundConfig = useMemo(() => {
    if (!hydrated) return null;
    const idx = currentIndex;
    const hash = dateHash(today, idx);
    const asset = DAILY_ASSETS[hash % DAILY_ASSETS.length];
    const tf = DAILY_TIMEFRAMES[hash % DAILY_TIMEFRAMES.length];
    return { asset: asset.symbol, timeframe: tf };
  }, [hydrated, currentIndex, today]);

  const loadRound = useCallback(() => {
    if (!roundConfig) return;
    fetchChart({ asset: roundConfig.asset, timeframe: roundConfig.timeframe });
  }, [fetchChart, roundConfig]);

  // Start or resume daily
  const handleStart = useCallback(() => {
    startDaily(today);
    setStarted(true);
  }, [startDaily, today]);

  // Load chart when started
  useEffect(() => {
    if (started && roundConfig) {
      loadRound();
    }
  }, [started, roundConfig, loadRound]);

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
    const betAmount = 1000; // Fixed bet for daily
    const tradeResult = calculateTrade({ direction, leverage: 1, entryPrice, exitPrice, betAmount });
    setResult(tradeResult);

    recordDailyTrade({
      asset: chart.asset.symbol,
      direction,
      pnl: tradeResult.pnl,
      isWin: tradeResult.isWin,
    });
  }, [chart, direction, setResult, recordDailyTrade]);

  const handleNext = useCallback(() => {
    const nextIdx = currentIndex;
    if (nextIdx >= DAILY_CHALLENGE_COUNT) {
      completeDaily();
      setStarted(false);
      reset();
      return;
    }
    reset();
    // Will trigger loadRound via effect
  }, [currentIndex, completeDaily, reset]);

  // Auto-resume if in progress
  useEffect(() => {
    if (isInProgress && !started) {
      setStarted(true);
    }
  }, [isInProgress, started]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </main>
    );
  }

  // Show completed screen
  if (isCompletedToday) {
    const todayResult = pastResults.find((r) => r.date === today);
    return (
      <main className="min-h-dvh pb-20">
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-xl font-bold">Daily Challenge</h1>
          <p className="mt-0.5 text-xs text-text-muted">{today}</p>
        </div>

        <div className="mx-4 mt-6 rounded-2xl border border-accent/20 bg-accent-bg p-6 text-center">
          <p className="text-lg font-bold text-accent">Challenge Complete!</p>
          <p className={cn(
            "mt-2 text-4xl font-black tabular-nums",
            (todayResult?.totalPnl ?? 0) >= 0 ? "text-profit" : "text-loss",
          )}>
            {(todayResult?.totalPnl ?? 0) >= 0 ? "+" : ""}{formatCurrency(todayResult?.totalPnl ?? 0)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {todayResult?.tradesWon ?? 0}/{todayResult?.totalTrades ?? 0} trades won
          </p>
        </div>

        {todayResult && (
          <div className="mx-4 mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Trades</h3>
            {todayResult.trades.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted">#{i + 1}</span>
                  <span className="text-sm font-medium">{t.asset}</span>
                  <span className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                    t.direction === "long" ? "bg-profit-bg text-profit" : "bg-loss-bg text-loss",
                  )}>
                    {t.direction}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  t.pnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {t.pnl >= 0 ? "+" : ""}{formatCurrency(t.pnl)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Past results */}
        {pastResults.length > 1 && (
          <div className="mx-4 mt-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Past Challenges</h3>
            {pastResults.filter(r => r.date !== today).slice(0, 7).map((r) => (
              <div key={r.date} className="flex items-center justify-between border-b border-border py-2.5">
                <div>
                  <span className="text-sm font-medium">{r.date}</span>
                  <span className="ml-2 text-xs text-text-muted">{r.tradesWon}/{r.totalTrades} won</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  r.totalPnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {r.totalPnl >= 0 ? "+" : ""}{formatCurrency(r.totalPnl)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mx-4 mt-6 flex flex-col items-center gap-2">
          <CountdownTimer />
          <p className="text-[10px] text-text-muted">New challenge drops at midnight</p>
        </div>
      </main>
    );
  }

  // Show start screen
  if (!started) {
    return (
      <main className="min-h-dvh pb-20">
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-xl font-bold">Daily Challenge</h1>
          <p className="mt-0.5 text-xs text-text-muted">{today}</p>
        </div>

        <div className="mx-4 mt-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-4xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="text-2xl font-black">Today&apos;s Challenge</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {DAILY_CHALLENGE_COUNT} charts. Same for everyone. Fixed $1,000 bets.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            No leverage. Pure skill.
          </p>

          <button
            onClick={handleStart}
            className="mt-8 w-full max-w-xs rounded-xl bg-accent py-4 text-base font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Start Challenge
          </button>
        </div>

        {/* Past results */}
        {pastResults.length > 0 && (
          <div className="mx-4 mt-8">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Past Challenges</h3>
            {pastResults.slice(0, 7).map((r) => (
              <div key={r.date} className="flex items-center justify-between border-b border-border py-2.5">
                <div>
                  <span className="text-sm font-medium">{r.date}</span>
                  <span className="ml-2 text-xs text-text-muted">{r.tradesWon}/{r.totalTrades} won</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  r.totalPnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {r.totalPnl >= 0 ? "+" : ""}{formatCurrency(r.totalPnl)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // In-game daily challenge screen
  return (
    <main className="flex h-dvh flex-col pb-14">
      {/* Progress header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-secondary/50 px-4 py-3">
        <div>
          <h1 className="text-sm font-bold text-accent">Daily Challenge</h1>
          <p className="text-[10px] text-text-muted">{today}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-text-muted">Round</span>
            <span className="text-xs font-bold tabular-nums">
              {Math.min(currentIndex + 1, DAILY_CHALLENGE_COUNT)}/{DAILY_CHALLENGE_COUNT}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-text-muted">P&L</span>
            <span className={cn(
              "text-xs font-bold tabular-nums",
              totalPnl >= 0 ? "text-profit" : "text-loss",
            )}>
              {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-text-muted">Won</span>
            <span className="text-xs font-bold tabular-nums text-text-secondary">
              {tradesWon}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${(currentIndex / DAILY_CHALLENGE_COUNT) * 100}%` }}
        />
      </div>

      {/* Chart area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
              <p className="text-sm text-text-muted">Loading chart...</p>
            </div>
          </div>
        )}

        {chart && phase !== "loading" && (
          <>
            <ChartOverlay
              asset={chart.asset}
              timeframe={chart.timeframe}
            />

            <SwipeHandler enabled={phase === "viewing"} onSwipe={handleSwipe}>
              <div className="h-full px-1 pt-10 pb-2">
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
      <div className="shrink-0 border-t border-border bg-surface-secondary/30 px-4 py-3">
        {phase === "viewing" && (
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
        )}

        {(phase === "swiped" || phase === "revealing") && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <p className="text-sm font-medium text-text-secondary">Revealing...</p>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="py-3 text-center">
            <p className="text-xs text-text-muted">
              {currentIndex >= DAILY_CHALLENGE_COUNT
                ? "Challenge complete! Tap Next to see results."
                : `Round ${currentIndex}/${DAILY_CHALLENGE_COUNT} — Tap Next to continue`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
