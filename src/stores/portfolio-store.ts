"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trade } from "@/types/trade";
import type { UserStats } from "@/types/user";
import { STARTING_BALANCE } from "@/lib/game/constants";

interface PortfolioStore {
  balance: number;
  trades: Trade[];
  totalTrades: number;
  winningTrades: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  bestStreak: number;

  recordTrade: (trade: Omit<Trade, "id" | "createdAt">) => void;
  resetPortfolio: () => void;
  getStats: () => UserStats;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      balance: STARTING_BALANCE,
      trades: [],
      totalTrades: 0,
      winningTrades: 0,
      totalPnl: 0,
      bestTrade: 0,
      worstTrade: 0,
      currentStreak: 0,
      bestStreak: 0,

      recordTrade: (trade) => {
        const newTrade: Trade = {
          ...trade,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const newBalance =
            Math.round((state.balance + trade.pnl) * 100) / 100;
          const isWin = trade.pnl > 0;
          const newStreak = isWin ? state.currentStreak + 1 : 0;

          return {
            balance: newBalance,
            trades: [newTrade, ...state.trades].slice(0, 500), // keep last 500
            totalTrades: state.totalTrades + 1,
            winningTrades: state.winningTrades + (isWin ? 1 : 0),
            totalPnl:
              Math.round((state.totalPnl + trade.pnl) * 100) / 100,
            bestTrade: Math.max(state.bestTrade, trade.pnl),
            worstTrade: Math.min(state.worstTrade, trade.pnl),
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
          };
        });
      },

      resetPortfolio: () =>
        set({
          balance: STARTING_BALANCE,
          trades: [],
          totalTrades: 0,
          winningTrades: 0,
          totalPnl: 0,
          bestTrade: 0,
          worstTrade: 0,
          currentStreak: 0,
          bestStreak: 0,
        }),

      getStats: (): UserStats => {
        const state = get();
        return {
          balance: state.balance,
          totalTrades: state.totalTrades,
          winningTrades: state.winningTrades,
          winRate:
            state.totalTrades > 0
              ? state.winningTrades / state.totalTrades
              : 0,
          totalPnl: state.totalPnl,
          bestTrade: state.bestTrade,
          worstTrade: state.worstTrade,
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
        };
      },
    }),
    {
      name: "swipetrade-portfolio",
    },
  ),
);
