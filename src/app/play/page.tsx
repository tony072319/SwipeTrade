"use client";

import { useState, useCallback } from "react";
import GameScreen from "@/components/game/GameScreen";
import PortfolioBar from "@/components/portfolio/PortfolioBar";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { useGameStore } from "@/stores/game-store";
import { STARTING_BALANCE } from "@/lib/game/constants";

export default function PlayPage() {
  const hydrated = useHydration();
  const { balance, totalPnl, totalTrades, winningTrades, recordTrade } =
    usePortfolioStore();
  const { chart, direction, leverage } = useGameStore();
  const [flash, setFlash] = useState<"profit" | "loss" | null>(null);

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
  const currentBalance = hydrated ? balance : STARTING_BALANCE;

  const handleTrade = useCallback(
    (pnl: number) => {
      // Record trade in portfolio store (persists to localStorage)
      if (chart && direction) {
        recordTrade({
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
        });
      }

      setFlash(pnl >= 0 ? "profit" : "loss");
      setTimeout(() => setFlash(null), 600);
    },
    [chart, direction, leverage, currentBalance, recordTrade],
  );

  return (
    <main className="flex h-dvh flex-col pb-14">
      {/* Portfolio header */}
      <PortfolioBar
        balance={currentBalance}
        totalPnl={hydrated ? totalPnl : 0}
        winRate={hydrated ? winRate : 0}
        flash={flash}
      />

      {/* Game area */}
      <div className="flex-1 overflow-hidden">
        <GameScreen balance={currentBalance} onTrade={handleTrade} />
      </div>
    </main>
  );
}
