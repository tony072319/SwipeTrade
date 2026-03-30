"use client";

import { useCallback, useRef } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useAchievementsStore } from "@/stores/achievements-store";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

export default function DataExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const portfolio = usePortfolioStore.getState();
    const achievements = useAchievementsStore.getState();
    const settings = useSettingsStore.getState();

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      portfolio: {
        balance: portfolio.balance,
        trades: portfolio.trades,
        totalTrades: portfolio.totalTrades,
        winningTrades: portfolio.winningTrades,
        totalPnl: portfolio.totalPnl,
        bestTrade: portfolio.bestTrade,
        worstTrade: portfolio.worstTrade,
        currentStreak: portfolio.currentStreak,
        bestStreak: portfolio.bestStreak,
      },
      achievements: achievements.unlocked,
      settings: {
        accentColor: settings.accentColor,
        difficulty: settings.difficulty,
        revealSpeed: settings.revealSpeed,
        soundEnabled: settings.soundEnabled,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swipetrade-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.version !== 1 || !data.portfolio) {
          alert("Invalid backup file format.");
          return;
        }

        if (!confirm("This will replace all your current data. Continue?")) return;

        // Restore portfolio
        const p = data.portfolio;
        usePortfolioStore.setState({
          balance: p.balance,
          trades: p.trades,
          totalTrades: p.totalTrades,
          winningTrades: p.winningTrades,
          totalPnl: p.totalPnl,
          bestTrade: p.bestTrade,
          worstTrade: p.worstTrade,
          currentStreak: p.currentStreak,
          bestStreak: p.bestStreak,
        });

        // Restore achievements
        if (data.achievements) {
          useAchievementsStore.setState({
            unlocked: data.achievements,
            newlyUnlocked: [],
          });
        }

        // Restore settings
        if (data.settings) {
          useSettingsStore.setState({
            accentColor: data.settings.accentColor,
            difficulty: data.settings.difficulty,
            revealSpeed: data.settings.revealSpeed,
            soundEnabled: data.settings.soundEnabled,
          });
        }

        alert("Data restored successfully!");
      } catch {
        alert("Failed to read backup file.");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Data</h2>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 rounded-xl border border-border bg-surface-secondary py-3 text-xs font-bold text-text-secondary transition-colors hover:bg-surface-tertiary"
        >
          Export Backup
        </button>
        <label className={cn(
          "flex-1 cursor-pointer rounded-xl border border-border bg-surface-secondary py-3 text-center text-xs font-bold text-text-secondary transition-colors hover:bg-surface-tertiary",
        )}>
          Import Backup
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
