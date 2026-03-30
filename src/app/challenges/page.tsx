"use client";

import { useState, useCallback, useEffect } from "react";
import { useChart } from "@/hooks/useChart";
import { useGameStore } from "@/stores/game-store";
import { useHydration } from "@/hooks/useHydration";
import { calculateTrade } from "@/lib/game/engine";
import { formatCurrency, cn } from "@/lib/utils";
import ChartReveal from "@/components/chart/ChartReveal";
import ChartOverlay from "@/components/chart/ChartOverlay";
import SwipeHandler from "@/components/game/SwipeHandler";
import TradeResult from "@/components/game/TradeResult";
import type { Direction } from "@/types/trade";
import Link from "next/link";

interface Scenario {
  id: string;
  title: string;
  description: string;
  hint: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  asset?: string;
  timeframe?: string;
  betAmount: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "trend-follow",
    title: "Ride the Trend",
    description: "Identify the current trend direction and trade with it.",
    hint: "Look for higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend).",
    difficulty: "beginner",
    asset: "BTC",
    timeframe: "1D",
    betAmount: 1000,
  },
  {
    id: "reversal-spot",
    title: "Reversal Spotter",
    description: "Find the reversal signal and trade against the current trend.",
    hint: "Watch for exhaustion patterns: long wicks, doji candles at support/resistance.",
    difficulty: "intermediate",
    asset: "ETH",
    timeframe: "4h",
    betAmount: 500,
  },
  {
    id: "volatile-crypto",
    title: "Volatile Waters",
    description: "Navigate a highly volatile crypto chart with big swings.",
    hint: "Focus on the last few candles. In volatile markets, momentum often continues briefly.",
    difficulty: "advanced",
    asset: "SOL",
    timeframe: "1h",
    betAmount: 500,
  },
  {
    id: "blue-chip",
    title: "Blue Chip Steady",
    description: "Read a steady stock chart where moves are subtle.",
    hint: "Subtle clues matter: slight upward drift, increasing candle bodies, volume changes.",
    difficulty: "beginner",
    asset: "AAPL",
    timeframe: "1D",
    betAmount: 1000,
  },
  {
    id: "breakout",
    title: "Breakout Trader",
    description: "Identify consolidation and predict the breakout direction.",
    hint: "After a tight range, a strong candle in either direction often leads to continuation.",
    difficulty: "intermediate",
    asset: "TSLA",
    timeframe: "4h",
    betAmount: 750,
  },
  {
    id: "momentum",
    title: "Momentum Play",
    description: "Catch the momentum move on a fast-moving chart.",
    hint: "Three consecutive green/red candles with growing bodies suggest strong momentum.",
    difficulty: "advanced",
    timeframe: "1h",
    betAmount: 500,
  },
  {
    id: "etf-tracker",
    title: "ETF Navigator",
    description: "Read broad market ETFs — they move differently than individual stocks.",
    hint: "ETFs are less volatile. Focus on gradual trends, support zones, and sector rotation signals.",
    difficulty: "beginner",
    asset: "SPY",
    timeframe: "1D",
    betAmount: 1000,
  },
  {
    id: "gold-safe-haven",
    title: "Gold Rush",
    description: "Trade gold ETF — a classic safe-haven asset with unique patterns.",
    hint: "Gold tends to trend for long periods. Look for momentum and avoid counter-trend trades.",
    difficulty: "intermediate",
    asset: "GLD",
    timeframe: "1D",
    betAmount: 750,
  },
  {
    id: "meme-stock",
    title: "Meme Stock Madness",
    description: "Navigate the chaos of a volatile growth stock.",
    hint: "Extreme moves can reverse fast. Look for exhaustion signals like long wicks after big moves.",
    difficulty: "advanced",
    asset: "PLTR",
    timeframe: "1h",
    betAmount: 500,
  },
  {
    id: "pharma-play",
    title: "Healthcare Sector",
    description: "Trade a healthcare stock with its unique catalysts and patterns.",
    hint: "Pharma stocks can gap. Focus on the trend before the gap, not the gap itself.",
    difficulty: "intermediate",
    asset: "LLY",
    timeframe: "4h",
    betAmount: 750,
  },
  {
    id: "energy-trade",
    title: "Energy Markets",
    description: "Read energy sector charts driven by oil and macro events.",
    hint: "Energy stocks trend strongly. Look for breakouts from consolidation ranges.",
    difficulty: "intermediate",
    asset: "XOM",
    timeframe: "1D",
    betAmount: 750,
  },
  {
    id: "defi-altcoin",
    title: "DeFi Deep Dive",
    description: "Trade a DeFi protocol token with its own market dynamics.",
    hint: "Altcoins often follow BTC but with higher beta. Check if BTC is trending first.",
    difficulty: "advanced",
    asset: "AAVE",
    timeframe: "4h",
    betAmount: 500,
  },
];

const DIFFICULTY_COLORS = {
  beginner: "text-profit bg-profit/10 border-profit/20",
  intermediate: "text-accent bg-accent/10 border-accent/20",
  advanced: "text-loss bg-loss/10 border-loss/20",
};

export default function ChallengesPage() {
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

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [scenarioResults, setScenarioResults] = useState<Record<string, { pnl: number; won: boolean }>>({});

  // Load completed scenarios from localStorage
  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem("swipetrade-scenario-results");
    if (saved) {
      try {
        setScenarioResults(JSON.parse(saved));
      } catch {}
    }
  }, [hydrated]);

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

  const startScenario = useCallback(
    (scenario: Scenario) => {
      setActiveScenario(scenario);
      setShowHint(false);
      reset();
      const params: Record<string, string> = {};
      if (scenario.asset) params.asset = scenario.asset;
      if (scenario.timeframe) params.timeframe = scenario.timeframe;
      fetchChart(Object.keys(params).length > 0 ? params : undefined);
    },
    [reset, fetchChart],
  );

  const handleSwipe = useCallback(
    (dir: Direction) => {
      if (phase !== "viewing") return;
      submitSwipe(dir);
    },
    [phase, submitSwipe],
  );

  const handleRevealComplete = useCallback(() => {
    if (!chart || !direction || !activeScenario) return;
    const entryPrice = chart.visibleCandles[chart.visibleCandles.length - 1].close;
    const exitPrice = chart.hiddenCandles[chart.hiddenCandles.length - 1].close;
    const tradeResult = calculateTrade({
      direction,
      leverage: 1,
      entryPrice,
      exitPrice,
      betAmount: activeScenario.betAmount,
    });
    setResult(tradeResult);

    // Save result
    const newResults = {
      ...scenarioResults,
      [activeScenario.id]: { pnl: tradeResult.pnl, won: tradeResult.isWin },
    };
    setScenarioResults(newResults);
    localStorage.setItem("swipetrade-scenario-results", JSON.stringify(newResults));
  }, [chart, direction, activeScenario, setResult, scenarioResults]);

  const handleNext = useCallback(() => {
    setActiveScenario(null);
    reset();
  }, [reset]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (activeScenario && phase === "viewing") {
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
  }, [activeScenario, phase, handleSwipe, handleNext]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </main>
    );
  }

  // Active scenario — game view
  if (activeScenario) {
    return (
      <main className="flex h-dvh flex-col pb-14">
        {/* Scenario header */}
        <div className="shrink-0 border-b border-border bg-surface-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold">{activeScenario.title}</h1>
              <p className="text-[10px] text-text-muted">{activeScenario.description}</p>
            </div>
            <button
              onClick={() => setShowHint(!showHint)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all",
                showHint ? "bg-accent text-white" : "bg-surface-tertiary text-text-muted",
              )}
            >
              Hint
            </button>
          </div>
          {showHint && (
            <div className="mt-2 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 animate-fade-in">
              <p className="text-[10px] text-accent">{activeScenario.hint}</p>
            </div>
          )}
        </div>

        {/* Chart area */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {phase === "loading" && (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
            </div>
          )}

          {chart && phase !== "loading" && (
            <>
              <ChartOverlay
                asset={chart.asset}
                timeframe={chart.timeframe}
                candles={phase === "viewing" ? chart.visibleCandles : undefined}
              />

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
                <TradeResult result={result} balance={10000} onNext={handleNext} />
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
              <p className="text-xs text-text-muted">Tap &quot;Next Trade&quot; to go back</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Scenario selection
  const completedCount = Object.keys(scenarioResults).length;

  return (
    <main className="min-h-dvh pb-20">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Challenge Scenarios</h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Practice specific trading situations
        </p>
      </div>

      {/* Progress */}
      {completedCount > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-border bg-surface-secondary p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-text-muted">Completed</p>
            <p className="text-sm font-bold">{completedCount}/{SCENARIOS.length}</p>
          </div>
          <div className="h-2 flex-1 mx-4 rounded-full bg-surface-tertiary overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${(completedCount / SCENARIOS.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-accent">
            {Math.round((completedCount / SCENARIOS.length) * 100)}%
          </p>
        </div>
      )}

      {/* Scenario cards */}
      <div className="px-4 mt-4 space-y-3">
        {SCENARIOS.map((scenario) => {
          const result = scenarioResults[scenario.id];
          return (
            <button
              key={scenario.id}
              onClick={() => startScenario(scenario)}
              className="w-full rounded-2xl border border-border bg-surface-secondary p-4 text-left transition-all hover:bg-surface-tertiary active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{scenario.title}</h3>
                    <span className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[8px] font-bold uppercase",
                      DIFFICULTY_COLORS[scenario.difficulty],
                    )}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                    {scenario.asset && <span>{scenario.asset}</span>}
                    {scenario.timeframe && <span>{scenario.timeframe}</span>}
                    <span>${scenario.betAmount} bet</span>
                  </div>
                </div>
                {result ? (
                  <div className="text-right shrink-0">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      result.won ? "bg-profit/10" : "bg-loss/10",
                    )}>
                      {result.won ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-profit">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-loss">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <p className={cn(
                      "text-[10px] font-bold mt-0.5",
                      result.pnl >= 0 ? "text-profit" : "text-loss",
                    )}>
                      {result.pnl >= 0 ? "+" : ""}{formatCurrency(result.pnl)}
                    </p>
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Back link */}
      <div className="mx-4 mt-6 text-center">
        <Link
          href="/play"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Back to Free Play
        </Link>
      </div>
    </main>
  );
}
