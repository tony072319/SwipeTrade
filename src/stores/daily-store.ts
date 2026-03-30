"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DAILY_CHALLENGE_COUNT } from "@/lib/game/constants";

interface DailyResult {
  date: string;
  totalPnl: number;
  tradesWon: number;
  totalTrades: number;
  completed: boolean;
  trades: {
    asset: string;
    direction: "long" | "short";
    pnl: number;
    isWin: boolean;
  }[];
}

interface DailyStore {
  currentDate: string | null;
  currentIndex: number;
  totalPnl: number;
  tradesWon: number;
  completed: boolean;
  trades: DailyResult["trades"];
  pastResults: DailyResult[];

  startDaily: (date: string) => void;
  recordDailyTrade: (trade: DailyResult["trades"][0]) => void;
  completeDaily: () => void;
  getTodayResult: () => DailyResult | null;
  isCompletedToday: (date: string) => boolean;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export const useDailyStore = create<DailyStore>()(
  persist(
    (set, get) => ({
      currentDate: null,
      currentIndex: 0,
      totalPnl: 0,
      tradesWon: 0,
      completed: false,
      trades: [],
      pastResults: [],

      startDaily: (date) => {
        const state = get();
        // Already started today
        if (state.currentDate === date) return;
        set({
          currentDate: date,
          currentIndex: 0,
          totalPnl: 0,
          tradesWon: 0,
          completed: false,
          trades: [],
        });
      },

      recordDailyTrade: (trade) => {
        set((state) => ({
          trades: [...state.trades, trade],
          currentIndex: state.currentIndex + 1,
          totalPnl: Math.round((state.totalPnl + trade.pnl) * 100) / 100,
          tradesWon: state.tradesWon + (trade.isWin ? 1 : 0),
        }));
      },

      completeDaily: () => {
        const state = get();
        const result: DailyResult = {
          date: state.currentDate || getTodayString(),
          totalPnl: state.totalPnl,
          tradesWon: state.tradesWon,
          totalTrades: state.trades.length,
          completed: true,
          trades: state.trades,
        };
        set((s) => ({
          completed: true,
          pastResults: [result, ...s.pastResults].slice(0, 30), // keep 30 days
        }));
      },

      getTodayResult: () => {
        const state = get();
        const today = getTodayString();
        return state.pastResults.find((r) => r.date === today) || null;
      },

      isCompletedToday: (date) => {
        const state = get();
        return state.currentDate === date && state.completed;
      },
    }),
    {
      name: "swipetrade-daily",
    },
  ),
);

export { DAILY_CHALLENGE_COUNT };
