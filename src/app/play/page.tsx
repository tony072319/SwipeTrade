"use client";

import { useState, useCallback } from "react";
import GameScreen from "@/components/game/GameScreen";
import { formatCurrency } from "@/lib/utils";
import { STARTING_BALANCE } from "@/lib/game/constants";
import { cn } from "@/lib/utils";

export default function PlayPage() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [flash, setFlash] = useState<"profit" | "loss" | null>(null);

  const handleTrade = useCallback((pnl: number) => {
    setBalance((prev) => Math.round((prev + pnl) * 100) / 100);
    setFlash(pnl >= 0 ? "profit" : "loss");
    setTimeout(() => setFlash(null), 600);
  }, []);

  return (
    <main className="flex h-dvh flex-col">
      {/* Header with portfolio */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">SwipeTrade</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Balance</span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums transition-colors duration-300",
              flash === "profit" && "text-profit",
              flash === "loss" && "text-loss",
              !flash && "text-text-primary",
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 overflow-hidden">
        <GameScreen balance={balance} onTrade={handleTrade} />
      </div>
    </main>
  );
}
