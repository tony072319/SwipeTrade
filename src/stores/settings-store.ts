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

interface SettingsStore {
  selectedAsset: Asset | null; // null = random
  selectedTimeframe: TimeFrame | null; // null = random for asset type
  enabledIndicators: IndicatorId[];
  theme: "dark" | "light";
  revealSpeed: 1 | 2 | 4;
  soundEnabled: boolean;
  accentColor: AccentColor;

  setSelectedAsset: (asset: Asset | null) => void;
  setSelectedTimeframe: (tf: TimeFrame | null) => void;
  toggleIndicator: (id: IndicatorId) => void;
  setTheme: (theme: "dark" | "light") => void;
  setRevealSpeed: (speed: 1 | 2 | 4) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAccentColor: (color: AccentColor) => void;
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
    }),
    {
      name: "swipetrade-settings",
    },
  ),
);
