"use client";

import { create } from "zustand";
import type { ChartData } from "@/types/chart";
import type { Direction, TradeResult } from "@/types/trade";
import type { GamePhase } from "@/types/game";
import { DEFAULT_LEVERAGE } from "@/lib/game/constants";

interface GameStore {
  phase: GamePhase;
  chart: ChartData | null;
  direction: Direction | null;
  leverage: number;
  revealedCount: number;
  result: TradeResult | null;

  setChart: (chart: ChartData) => void;
  setLoading: () => void;
  setViewing: () => void;
  submitSwipe: (direction: Direction) => void;
  setRevealing: () => void;
  incrementRevealed: () => void;
  setResult: (result: TradeResult) => void;
  setLeverage: (leverage: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  phase: "loading",
  chart: null,
  direction: null,
  leverage: DEFAULT_LEVERAGE,
  revealedCount: 0,
  result: null,

  setChart: (chart) => set({ chart, phase: "viewing" }),
  setLoading: () =>
    set({
      phase: "loading",
      chart: null,
      direction: null,
      revealedCount: 0,
      result: null,
    }),
  setViewing: () => set({ phase: "viewing" }),
  submitSwipe: (direction) => set({ direction, phase: "swiped" }),
  setRevealing: () => set({ phase: "revealing", revealedCount: 0 }),
  incrementRevealed: () =>
    set((state) => ({ revealedCount: state.revealedCount + 1 })),
  setResult: (result) => set({ result, phase: "result" }),
  setLeverage: (leverage) => set({ leverage }),
  reset: () =>
    set({
      phase: "loading",
      chart: null,
      direction: null,
      leverage: DEFAULT_LEVERAGE,
      revealedCount: 0,
      result: null,
    }),
}));
