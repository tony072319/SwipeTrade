"use client";

import { useState, useCallback, useEffect } from "react";
import GameScreen from "@/components/game/GameScreen";
import PortfolioBar from "@/components/portfolio/PortfolioBar";
import TutorialOverlay from "@/components/game/TutorialOverlay";
import AchievementToast from "@/components/game/AchievementToast";
import Confetti from "@/components/game/Confetti";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useAchievementsStore } from "@/stores/achievements-store";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import { useGameStore } from "@/stores/game-store";
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
        betAmount: Math.round(currentBalance * 0.1 * 100) / 100,
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

      {/* Portfolio header */}
      <PortfolioBar
        balance={currentBalance}
        totalPnl={hydrated ? totalPnl : 0}
        winRate={hydrated ? winRate : 0}
        streak={hydrated ? currentStreak : 0}
        flash={flash}
      />

      {/* Game area */}
      <div className="min-h-0 flex-1">
        <GameScreen balance={currentBalance} onTrade={handleTrade} />
      </div>
    </main>
  );
}
