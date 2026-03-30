"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnlockedAchievement } from "@/lib/achievements";

interface AchievementsStore {
  unlocked: UnlockedAchievement[];
  /** Achievement IDs the user hasn't dismissed yet */
  newlyUnlocked: string[];

  addUnlocked: (achievements: UnlockedAchievement[]) => void;
  dismissNew: (id: string) => void;
  dismissAll: () => void;
}

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set) => ({
      unlocked: [],
      newlyUnlocked: [],

      addUnlocked: (achievements) =>
        set((state) => ({
          unlocked: [...state.unlocked, ...achievements],
          newlyUnlocked: [...state.newlyUnlocked, ...achievements.map((a) => a.id)],
        })),

      dismissNew: (id) =>
        set((state) => ({
          newlyUnlocked: state.newlyUnlocked.filter((i) => i !== id),
        })),

      dismissAll: () => set({ newlyUnlocked: [] }),
    }),
    { name: "swipetrade-achievements" },
  ),
);
