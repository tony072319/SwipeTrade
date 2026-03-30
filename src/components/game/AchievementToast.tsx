"use client";

import { useEffect, useState } from "react";
import { useAchievementsStore } from "@/stores/achievements-store";
import { ACHIEVEMENTS, TIER_COLORS, TIER_BORDER } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export default function AchievementToast() {
  const { newlyUnlocked, dismissNew } = useAchievementsStore();
  const [visible, setVisible] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && !visible) {
      const id = newlyUnlocked[0];
      setVisible(id);
      setAnimating(true);

      const timer = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          dismissNew(id);
          setVisible(null);
        }, 300);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, visible, dismissNew]);

  if (!visible) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === visible);
  if (!achievement) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300",
        animating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
          "bg-surface-primary/95",
          TIER_BORDER[achievement.tier],
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg",
            TIER_COLORS[achievement.tier],
          )}
        >
          {achievement.icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Achievement Unlocked
          </p>
          <p className="text-sm font-bold text-text-primary">{achievement.title}</p>
          <p className="text-[10px] text-text-secondary">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
