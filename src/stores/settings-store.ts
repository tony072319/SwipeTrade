"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset, TimeFrame } from "@/types/chart";

export type IndicatorId = "volume" | "ema9" | "ema21" | "rsi" | "macd" | "bollinger";

export type AccentColor = "indigo" | "cyan" | "emerald" | "rose" | "amber" | "violet";

export const ACCENT_COLORS: Record<AccentColor, string> = {
  indigo: "#6366f1",
  cyan: "#06b6d4",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  violet: "#8b5cf6",
};

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; visible: number; hidden: number; desc: string }> = {
  easy: { label: "Easy", visible: 60, hidden: 15, desc: "60 visible, 15 hidden" },
  normal: { label: "Normal", visible: 50, hidden: 20, desc: "50 visible, 20 hidden" },
  hard: { label: "Hard", visible: 35, hidden: 25, desc: "35 visible, 25 hidden" },
};

interface SettingsStore {
  selectedAsset: Asset | null; // null = random
  selectedTimeframe: TimeFrame | null; // null = random for asset type
  enabledIndicators: IndicatorId[];
  theme: "dark" | "light";
  revealSpeed: 1 | 2 | 4;
  soundEnabled: boolean;
  accentColor: AccentColor;
  difficulty: Difficulty;
  recentAssets: string[]; // symbol list, most recent first
  favoriteAssets: string[]; // symbol list

  setSelectedAsset: (asset: Asset | null) => void;
  setSelectedTimeframe: (tf: TimeFrame | null) => void;
  toggleIndicator: (id: IndicatorId) => void;
  setTheme: (theme: "dark" | "light") => void;
  setRevealSpeed: (speed: 1 | 2 | 4) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAccentColor: (color: AccentColor) => void;
  setDifficulty: (d: Difficulty) => void;
  addRecentAsset: (symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      selectedAsset: null,
      selectedTimeframe: null,
      enabledIndicators: [],
      theme: "dark",
      revealSpeed: 1,
      soundEnabled: true,
      accentColor: "indigo",
      difficulty: "normal",
      recentAssets: [],
      favoriteAssets: [],

      setSelectedAsset: (asset) => set({ selectedAsset: asset }),
      setSelectedTimeframe: (tf) => set({ selectedTimeframe: tf }),
      toggleIndicator: (id) =>
        set((state) => ({
          enabledIndicators: state.enabledIndicators.includes(id)
            ? state.enabledIndicators.filter((i) => i !== id)
            : [...state.enabledIndicators, id],
        })),
      setTheme: (theme) => set({ theme }),
      setRevealSpeed: (speed) => set({ revealSpeed: speed }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAccentColor: (color) => set({ accentColor: color }),
      setDifficulty: (d) => set({ difficulty: d }),
      addRecentAsset: (symbol) =>
        set((state) => ({
          recentAssets: [symbol, ...state.recentAssets.filter((s) => s !== symbol)].slice(0, 5),
        })),
      toggleFavorite: (symbol) =>
        set((state) => ({
          favoriteAssets: state.favoriteAssets.includes(symbol)
            ? state.favoriteAssets.filter((s) => s !== symbol)
            : [...state.favoriteAssets, symbol],
        })),
    }),
    {
      name: "swipetrade-settings",
    },
  ),
);
