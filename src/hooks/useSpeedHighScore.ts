"use client";

import { useState, useCallback, useEffect } from "react";

interface SpeedHighScore {
  bestPnl: number;
  bestTradeCount: number;
  bestCombo: number;
  bestWinRate: number;
  gamesPlayed: number;
}

const STORAGE_KEY = "swipetrade-speed-highscore";

const DEFAULT: SpeedHighScore = {
  bestPnl: 0,
  bestTradeCount: 0,
  bestCombo: 0,
  bestWinRate: 0,
  gamesPlayed: 0,
};

export function useSpeedHighScore() {
  const [highScore, setHighScore] = useState<SpeedHighScore>(DEFAULT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHighScore({ ...DEFAULT, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const recordGame = useCallback(
    (pnl: number, tradeCount: number, combo: number, winRate: number) => {
      setHighScore((prev) => {
        const updated: SpeedHighScore = {
          bestPnl: Math.max(prev.bestPnl, pnl),
          bestTradeCount: Math.max(prev.bestTradeCount, tradeCount),
          bestCombo: Math.max(prev.bestCombo, combo),
          bestWinRate: Math.max(prev.bestWinRate, winRate),
          gamesPlayed: prev.gamesPlayed + 1,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const isNewRecord = useCallback(
    (pnl: number) => pnl > highScore.bestPnl && highScore.gamesPlayed > 0,
    [highScore.bestPnl, highScore.gamesPlayed],
  );

  return { highScore, recordGame, isNewRecord };
}
