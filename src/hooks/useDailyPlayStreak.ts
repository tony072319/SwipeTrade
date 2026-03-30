"use client";

import { useEffect, useState } from "react";

const STREAK_KEY = "swipetrade-play-streak";

interface StreakData {
  lastPlayDate: string;
  currentStreak: number;
  longestStreak: number;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function useDailyPlayStreak() {
  const [streak, setStreak] = useState<StreakData>({
    lastPlayDate: "",
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STREAK_KEY);
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    if (saved) {
      try {
        const data: StreakData = JSON.parse(saved);

        if (data.lastPlayDate === today) {
          // Already counted today
          setStreak(data);
          return;
        }

        if (data.lastPlayDate === yesterday) {
          // Consecutive day!
          const updated: StreakData = {
            lastPlayDate: today,
            currentStreak: data.currentStreak + 1,
            longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
          };
          localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
          setStreak(updated);
        } else {
          // Streak broken, start new
          const updated: StreakData = {
            lastPlayDate: today,
            currentStreak: 1,
            longestStreak: Math.max(data.longestStreak, 1),
          };
          localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
          setStreak(updated);
        }
      } catch {
        const fresh: StreakData = {
          lastPlayDate: today,
          currentStreak: 1,
          longestStreak: 1,
        };
        localStorage.setItem(STREAK_KEY, JSON.stringify(fresh));
        setStreak(fresh);
      }
    } else {
      // First time
      const fresh: StreakData = {
        lastPlayDate: today,
        currentStreak: 1,
        longestStreak: 1,
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(fresh));
      setStreak(fresh);
    }
  }, []);

  return streak;
}
