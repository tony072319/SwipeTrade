"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useChart } from "@/hooks/useChart";
import { useGameStore } from "@/stores/game-store";
import { useHydration } from "@/hooks/useHydration";
import { calculateTrade } from "@/lib/game/engine";
import { formatCurrency, cn } from "@/lib/utils";
import ChartReveal from "@/components/chart/ChartReveal";
import SwipeHandler from "@/components/game/SwipeHandler";
import type { Direction } from "@/types/trade";
import Link from "next/link";

const SPEED_ROUND_TIME = 60; // seconds
const BET_AMOUNT = 500;

interface SpeedResult {
  direction: Direction;
  pnl: number;
  asset: string;
  combo: number;
}

export default function SpeedPage() {
  const hydrated = useHydration();
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

  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [timeLeft, setTimeLeft] = useState(SPEED_ROUND_TIME);
  const [totalPnl, setTotalPnl] = useState(0);
  const [trades, setTrades] = useState<SpeedResult[]>([]);
  const [roundCount, setRoundCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("finished");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Stop timer when finished
  useEffect(() => {
    if (gameState === "finished" && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameState]);

  useEffect(() => {
    if (chartData && !loading) setChart(chartData);
  }, [chartData, loading, setChart]);

  useEffect(() => {
    if (loading) setLoading();
  }, [loading, setLoading]);

  useEffect(() => {
    if (phase === "swiped") {
      const timer = setTimeout(() => setRevealing(), 100);
      return () => clearTimeout(timer);
    }
  }, [phase, setRevealing]);

  const handleStart = useCallback(() => {
    setGameState("playing");
    setTimeLeft(SPEED_ROUND_TIME);
    setTotalPnl(0);
    setTrades([]);
    setRoundCount(0);
    setCombo(0);
    setBestCombo(0);
    reset();
    fetchChart();
  }, [reset, fetchChart]);

  const handleSwipe = useCallback(
    (dir: Direction) => {
      if (phase !== "viewing" || gameState !== "playing") return;
      submitSwipe(dir);
    },
    [phase, gameState, submitSwipe],
  );

  const handleRevealComplete = useCallback(() => {
    if (!chart || !direction || gameState !== "playing") return;
    const entryPrice = chart.visibleCandles[chart.visibleCandles.length - 1].close;
    const exitPrice = chart.hiddenCandles[chart.hiddenCandles.length - 1].close;
    const tradeResult = calculateTrade({ direction, leverage: 1, entryPrice, exitPrice, betAmount: BET_AMOUNT });

    // Combo multiplier: 1x, 1.5x, 2x, 2.5x... for consecutive wins
    const isWin = tradeResult.pnl > 0;
    const currentCombo = isWin ? combo + 1 : 0;
    const multiplier = isWin && combo >= 1 ? 1 + combo * 0.5 : 1;
    const adjustedPnl = Math.round(tradeResult.pnl * multiplier * 100) / 100;

    setResult({ ...tradeResult, pnl: adjustedPnl });
    setCombo(currentCombo);
    if (currentCombo > bestCombo) setBestCombo(currentCombo);

    setTotalPnl((p) => Math.round((p + adjustedPnl) * 100) / 100);
    setTrades((t) => [...t, { direction, pnl: adjustedPnl, asset: chart.asset.symbol, combo: currentCombo }]);
    setRoundCount((c) => c + 1);

    // Auto-advance after brief pause
    setTimeout(() => {
      if (gameState === "playing") {
        reset();
        fetchChart();
      }
    }, 800);
  }, [chart, direction, gameState, combo, bestCombo, setResult, reset, fetchChart]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (gameState === "playing" && phase === "viewing") {
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "s") {
          e.preventDefault();
          handleSwipe("short");
        } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") {
          e.preventDefault();
          handleSwipe("long");
        }
      }
      if (gameState === "idle" || gameState === "finished") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleStart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, phase, handleSwipe, handleStart]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </main>
    );
  }

  // Idle / start screen
  if (gameState === "idle") {
    return (
      <main className="min-h-dvh pb-20 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-3xl font-black">Speed Round</h1>
          <p className="mt-3 text-sm text-text-secondary max-w-xs mx-auto">
            {SPEED_ROUND_TIME} seconds. As many trades as possible. How much can you make?
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-text-muted">
            <span>$500 per trade</span>
            <span>1x leverage</span>
            <span>Auto-advance</span>
          </div>

          <button
            onClick={handleStart}
            className="mt-8 rounded-2xl bg-accent px-12 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            GO!
          </button>
          <p className="mt-2 text-[10px] text-text-muted">Press Space to start</p>
        </div>
      </main>
    );
  }

  // Finished screen
  if (gameState === "finished") {
    const wins = trades.filter((t) => t.pnl > 0).length;
    const winRate = trades.length > 0 ? wins / trades.length : 0;

    return (
      <main className="min-h-dvh pb-20">
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-xl font-bold">Speed Round Results</h1>
        </div>

        <div className="mx-4 mt-6 rounded-2xl border border-accent/20 bg-accent-bg p-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Final P&L</p>
          <p className={cn(
            "mt-2 text-4xl font-black tabular-nums",
            totalPnl >= 0 ? "text-profit" : "text-loss",
          )}>
            {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
          </p>
        </div>

        <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-secondary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Trades</p>
            <p className="text-lg font-bold">{trades.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
            <p className={cn("text-lg font-bold", winRate >= 0.5 ? "text-profit" : "text-loss")}>
              {(winRate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Per Trade</p>
            <p className={cn("text-lg font-bold tabular-nums", totalPnl >= 0 ? "text-profit" : "text-loss")}>
              {trades.length > 0 ? `${totalPnl / trades.length >= 0 ? "+" : ""}${formatCurrency(totalPnl / trades.length)}` : "$0"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-3 text-center">
            <p className="text-[9px] uppercase text-text-muted">Best Combo</p>
            <p className="text-lg font-bold text-accent">{bestCombo}x</p>
          </div>
        </div>

        {/* Trade list */}
        {trades.length > 0 && (
          <div className="mx-4 mt-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-text-primary">Trades</h3>
            {trades.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted font-bold">#{i + 1}</span>
                  <span className="text-xs font-medium">{t.asset}</span>
                  <span className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    t.direction === "long" ? "bg-profit-bg text-profit" : "bg-loss-bg text-loss",
                  )}>
                    {t.direction}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {t.combo >= 2 && (
                    <span className="text-[9px] font-bold text-accent">{t.combo}x</span>
                  )}
                  <span className={cn(
                    "text-xs font-semibold tabular-nums",
                    t.pnl >= 0 ? "text-profit" : "text-loss",
                  )}>
                    {t.pnl >= 0 ? "+" : ""}{formatCurrency(t.pnl)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mx-4 mt-6 flex flex-col gap-3">
          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Play Again
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = `SwipeTrade Speed Round: ${trades.length} trades in 60s | ${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)} | ${(winRate * 100).toFixed(0)}% win rate | Best combo: ${bestCombo}x`;
                if (navigator.share) {
                  navigator.share({ text }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text).catch(() => {});
                }
              }}
              className="flex-1 rounded-xl border border-border py-3.5 text-center text-sm font-medium text-text-secondary transition-all hover:bg-surface-secondary"
            >
              Share Results
            </button>
            <Link
              href="/play"
              className="flex-1 rounded-xl border border-border py-3.5 text-center text-sm font-medium text-text-secondary transition-all hover:bg-surface-secondary"
            >
              Free Play
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Playing
  return (
    <main className="flex h-dvh flex-col pb-14">
      {/* Timer header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-secondary/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full font-mono text-lg font-black",
            timeLeft <= 10 ? "bg-loss/20 text-loss animate-pulse" : "bg-accent/20 text-accent",
          )}>
            {timeLeft}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-text-muted">Speed Round</p>
            <p className="text-xs font-bold tabular-nums">
              Round {roundCount + 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-text-muted">Combo</p>
              <p className="text-sm font-black text-accent animate-pulse tabular-nums">
                {combo}x {(1 + (combo - 1) * 0.5).toFixed(1)}x
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-text-muted">P&L</p>
            <p className={cn(
              "text-sm font-bold tabular-nums",
              totalPnl >= 0 ? "text-profit" : "text-loss",
            )}>
              {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
            </p>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-border">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            timeLeft <= 10 ? "bg-loss" : "bg-accent",
          )}
          style={{ width: `${(timeLeft / SPEED_ROUND_TIME) * 100}%` }}
        />
      </div>

      {/* Chart area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {phase === "loading" && (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
          </div>
        )}

        {chart && phase !== "loading" && (
          <SwipeHandler enabled={phase === "viewing"} onSwipe={handleSwipe}>
            <div className="h-full px-1 pt-2 pb-2">
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
                revealSpeed={4}
              />
            </div>
          </SwipeHandler>
        )}

        {/* Quick result flash */}
        {phase === "result" && result && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div className={cn(
              "rounded-2xl px-8 py-4 animate-scale-in text-center",
              result.isWin ? "bg-profit/20 border border-profit/30" : "bg-loss/20 border border-loss/30",
            )}>
              <p className={cn(
                "text-3xl font-black tabular-nums",
                result.isWin ? "text-profit" : "text-loss",
              )}>
                {result.pnl >= 0 ? "+" : ""}{formatCurrency(result.pnl)}
              </p>
              {combo >= 2 && result.isWin && (
                <p className="text-sm font-black text-accent mt-1 animate-bounce-in">
                  COMBO x{combo}!
                </p>
              )}
            </div>
          </div>
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

        {(phase === "swiped" || phase === "revealing" || phase === "result") && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <p className="text-sm font-medium text-text-secondary">
                {phase === "result" ? "Loading next..." : "Revealing..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
