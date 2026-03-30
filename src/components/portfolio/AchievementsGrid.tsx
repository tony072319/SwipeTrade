"use client";

import { useAchievementsStore } from "@/stores/achievements-store";
import { ACHIEVEMENTS, TIER_COLORS, TIER_BORDER, sortAchievements } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export default function AchievementsGrid() {
  const { unlocked } = useAchievementsStore();
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const sorted = sortAchievements(ACHIEVEMENTS);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Achievements</h2>
        <span className="text-xs text-text-muted">
          {unlockedCount}/{totalCount} unlocked
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-500"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sorted.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "rounded-xl border p-3 transition-all",
                isUnlocked
                  ? cn("bg-surface-secondary", TIER_BORDER[achievement.tier])
                  : "border-border bg-surface-secondary/50 opacity-50",
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm",
                    isUnlocked
                      ? cn("bg-gradient-to-br", TIER_COLORS[achievement.tier])
                      : "bg-surface-tertiary",
                  )}
                >
                  {isUnlocked ? achievement.icon : "?"}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-xs font-bold truncate",
                    isUnlocked ? "text-text-primary" : "text-text-muted",
                  )}>
                    {achievement.title}
                  </p>
                  <p className="text-[9px] text-text-muted leading-tight mt-0.5">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
