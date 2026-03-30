"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import GameScreen from "@/components/game/GameScreen";
import PortfolioBar from "@/components/portfolio/PortfolioBar";
import TutorialOverlay from "@/components/game/TutorialOverlay";
import AchievementToast from "@/components/game/AchievementToast";
import Confetti from "@/components/game/Confetti";
import KeyboardHelp from "@/components/game/KeyboardHelp";
import TradingTip from "@/components/game/TradingTip";
import StreakMilestone from "@/components/game/StreakMilestone";
import QuickStats from "@/components/portfolio/QuickStats";
import SessionSummary from "@/components/game/SessionSummary";
import MotivationalMessage from "@/components/game/MotivationalMessage";
import PortfolioMilestone from "@/components/game/PortfolioMilestone";
import MiniRecap from "@/components/game/MiniRecap";
import DailyGoal from "@/components/game/DailyGoal";
import SessionTimer from "@/components/game/SessionTimer";
import PriceTicker from "@/components/layout/PriceTicker";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useAchievementsStore } from "@/stores/achievements-store";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { STARTING_BALANCE } from "@/lib/game/constants";
import { checkAchievements } from "@/lib/achievements";

export default function PlayPage() {
  const hydrated = useHydration();
  const { user } = useAuth();
  const portfolio = usePortfolioStore();
  const { balance, totalPnl, totalTrades, winningTrades, currentStreak, bestStreak, bestTrade, worstTrade, trades, recordTrade } = portfolio;
  const { unlocked, addUnlocked } = useAchievementsStore();
  const { chart, direction, leverage } = useGameStore();
  const [flash, setFlash] = useState<"profit" | "loss" | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiIntensity, setConfettiIntensity] = useState<"low" | "medium" | "high">("medium");
  const [quickStatsOpen, setQuickStatsOpen] = useState(false);
  const prevStreakRef = useRef(currentStreak);

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
  const currentBalance = hydrated ? balance : STARTING_BALANCE;

  // Show tutorial on first visit
  useEffect(() => {
    if (!hydrated) return;
    const seen = localStorage.getItem("swipetrade-tutorial-seen");
    if (!seen && totalTrades === 0) {
      setShowTutorial(true);
    }
  }, [hydrated, totalTrades]);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem("swipetrade-tutorial-seen", "true");
  }, []);

  const handleTrade = useCallback(
    (pnl: number) => {
      if (!chart || !direction) return;

      const tradeData = {
        asset: chart.asset.symbol,
        assetType: chart.asset.type,
        timeframe: chart.timeframe,
        direction,
        leverage,
        entryPrice: chart.visibleCandles[chart.visibleCandles.length - 1].close,
        exitPrice: chart.hiddenCandles[chart.hiddenCandles.length - 1].close,
        betAmount: Math.round(currentBalance * (useSettingsStore.getState().betFraction || 0.1) * 100) / 100,
        pnl,
        isDailyChallenge: false,
      };

      // Record locally (persists to localStorage)
      recordTrade(tradeData);

      // Also sync to Supabase if authenticated
      if (user) {
        fetch("/api/trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tradeData),
        }).catch(() => {
          // Silently fail — local data is the source of truth
        });
      }

      setFlash(pnl >= 0 ? "profit" : "loss");
      setTimeout(() => setFlash(null), 600);

      // Check achievements after recording the trade
      setTimeout(() => {
        const state = usePortfolioStore.getState();
        const ctx = {
          balance: state.balance,
          totalTrades: state.totalTrades,
          winningTrades: state.winningTrades,
          totalPnl: state.totalPnl,
          bestTrade: state.bestTrade,
          worstTrade: state.worstTrade,
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
          trades: state.trades,
        };
        const newAchievements = checkAchievements(ctx, useAchievementsStore.getState().unlocked);
        if (newAchievements.length > 0) {
          addUnlocked(newAchievements);
        }
      }, 100);

      // Confetti for big wins
      if (pnl >= 200) {
        setConfettiIntensity(pnl >= 1000 ? "high" : pnl >= 500 ? "medium" : "low");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Update previous streak ref after a short delay (after store updates)
      setTimeout(() => {
        prevStreakRef.current = usePortfolioStore.getState().currentStreak;
      }, 200);
    },
    [chart, direction, leverage, currentBalance, recordTrade, user, addUnlocked],
  );

  return (
    <main className="flex h-dvh flex-col pb-14">
      {/* Tutorial overlay for first-time users */}
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}

      {/* Achievement toast */}
      <AchievementToast />

      {/* Confetti for big wins */}
      <Confetti active={showConfetti} intensity={confettiIntensity} />

      {/* Streak milestone celebrations */}
      <StreakMilestone streak={currentStreak} previousStreak={prevStreakRef.current} />

      {/* Session summary for returning users */}
      <SessionSummary />

      {/* Portfolio milestone celebrations */}
      <PortfolioMilestone />

      {/* Mini recap every 10 trades */}
      <MiniRecap />

      {/* Keyboard shortcuts help */}
      <KeyboardHelp />

      {/* Quick stats popup */}
      <QuickStats open={quickStatsOpen} onClose={() => setQuickStatsOpen(false)} />

      {/* Portfolio header */}
      <PortfolioBar
        balance={currentBalance}
        totalPnl={hydrated ? totalPnl : 0}
        winRate={hydrated ? winRate : 0}
        streak={hydrated ? currentStreak : 0}
        flash={flash}
        onBalanceTap={() => setQuickStatsOpen(true)}
      />

      {/* Price ticker */}
      <PriceTicker />

      {/* Motivational message */}
      <MotivationalMessage />

      {/* Daily goal tracker */}
      <DailyGoal />

      {/* Game area */}
      <div className="relative min-h-0 flex-1">
        <GameScreen balance={currentBalance} onTrade={handleTrade} />
        <TradingTip />
        <SessionTimer />
      </div>
    </main>
  );
}
