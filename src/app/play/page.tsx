"use client";

import { useState, useCallback } from "react";
import GameScreen from "@/components/game/GameScreen";
import PortfolioBar from "@/components/portfolio/PortfolioBar";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import { useGameStore } from "@/stores/game-store";
import { STARTING_BALANCE } from "@/lib/game/constants";

export default function PlayPage() {
  const hydrated = useHydration();
  const { user } = useAuth();
  const { balance, totalPnl, totalTrades, winningTrades, currentStreak, recordTrade } =
    usePortfolioStore();
  const { chart, direction, leverage } = useGameStore();
  const [flash, setFlash] = useState<"profit" | "loss" | null>(null);

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
  const currentBalance = hydrated ? balance : STARTING_BALANCE;

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
    },
    [chart, direction, leverage, currentBalance, recordTrade, user],
  );

  return (
    <main className="flex h-dvh flex-col pb-14">
      {/* Portfolio header */}
      <PortfolioBar
        balance={currentBalance}
        totalPnl={hydrated ? totalPnl : 0}
        winRate={hydrated ? winRate : 0}
        streak={hydrated ? currentStreak : 0}
        flash={flash}
      />

      {/* Game area */}
      <div className="flex-1 overflow-hidden">
        <GameScreen balance={currentBalance} onTrade={handleTrade} />
      </div>
    </main>
  );
}
