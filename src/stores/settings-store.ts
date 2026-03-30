"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset, TimeFrame } from "@/types/chart";

export type IndicatorId = "volume" | "ema9" | "ema21" | "rsi" | "macd" | "bollinger";

interface SettingsStore {
  selectedAsset: Asset | null; // null = random
  selectedTimeframe: TimeFrame | null; // null = random for asset type
  enabledIndicators: IndicatorId[];
  theme: "dark" | "light";
  revealSpeed: 1 | 2 | 4;
  soundEnabled: boolean;

  setSelectedAsset: (asset: Asset | null) => void;
  setSelectedTimeframe: (tf: TimeFrame | null) => void;
  toggleIndicator: (id: IndicatorId) => void;
  setTheme: (theme: "dark" | "light") => void;
  setRevealSpeed: (speed: 1 | 2 | 4) => void;
  setSoundEnabled: (enabled: boolean) => void;
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
    }),
    {
      name: "swipetrade-settings",
    },
  ),
);
