"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useDailyStore } from "@/stores/daily-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

// Mock leaderboard entries
const MOCK_LEADERS = [
  { name: "CryptoKing", balance: 52340, winRate: 0.72, streak: 12, trades: 245 },
  { name: "TradeBot3000", balance: 41200, winRate: 0.68, streak: 8, trades: 189 },
  { name: "DiamondHands", balance: 38750, winRate: 0.65, streak: 15, trades: 312 },
  { name: "BullRunner", balance: 31400, winRate: 0.61, streak: 6, trades: 156 },
  { name: "ChartWhisper", balance: 28900, winRate: 0.59, streak: 9, trades: 198 },
  { name: "SwipeQueen", balance: 24100, winRate: 0.57, streak: 7, trades: 134 },
  { name: "MomentumTrader", balance: 21800, winRate: 0.55, streak: 5, trades: 167 },
  { name: "CandleReader", balance: 19500, winRate: 0.53, streak: 4, trades: 98 },
  { name: "PriceAction", balance: 17200, winRate: 0.52, streak: 3, trades: 87 },
  { name: "Rookie", balance: 14800, winRate: 0.50, streak: 2, trades: 45 },
];

const PODIUM_COLORS = [
  "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  "from-slate-400/20 to-slate-500/5 border-slate-400/30",
  "from-amber-600/20 to-amber-700/5 border-amber-600/30",
];

const RANK_BADGES = ["text-yellow-400", "text-gray-300", "text-amber-600"];

type Tab = "balance" | "winrate" | "streak";

export default function LeaderboardPage() {
  const hydrated = useHydration();
  const { balance, totalTrades, winningTrades, currentStreak, bestStreak } = usePortfolioStore();
  const { pastResults } = useDailyStore();
  const [tab, setTab] = useState<Tab>("balance");

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const userEntry = {
    name: "You",
    balance: hydrated ? balance : 10000,
    winRate: hydrated ? winRate : 0,
    streak: hydrated ? bestStreak : 0,
    trades: hydrated ? totalTrades : 0,
    isUser: true,
  };

  const sortFn = (a: typeof userEntry, b: typeof userEntry) => {
    if (tab === "balance") return b.balance - a.balance;
    if (tab === "winrate") return b.winRate - a.winRate;
    return b.streak - a.streak;
  };

  const allEntries = [...MOCK_LEADERS.map((e) => ({ ...e, isUser: false })), userEntry]
    .sort(sortFn)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const userRank = allEntries.find((e) => e.isUser)?.rank ?? 0;
  const top3 = allEntries.slice(0, 3);
  const rest = allEntries.slice(3);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </main>
    );
  }

  const getValue = (entry: typeof userEntry) => {
    if (tab === "balance") return formatCurrency(entry.balance);
    if (tab === "winrate") return `${(entry.winRate * 100).toFixed(0)}%`;
    return `${entry.streak}W`;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "balance", label: "Portfolio" },
    { key: "winrate", label: "Win Rate" },
    { key: "streak", label: "Best Streak" },
  ];

  return (
    <main className="min-h-dvh pb-20">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <p className="mt-0.5 text-xs text-text-muted">Your rank: #{userRank}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
              tab === t.key
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium for top 3 */}
      <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-2">
        {/* 2nd place */}
        <div className={cn(
          "flex-1 rounded-xl border bg-gradient-to-b p-3 text-center",
          PODIUM_COLORS[1],
          top3[1]?.isUser && "ring-2 ring-accent",
        )}>
          <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-sm font-bold">
            {top3[1]?.name.charAt(0)}
          </div>
          <p className="text-[10px] font-bold text-text-secondary truncate">{top3[1]?.name}</p>
          <p className={cn("text-xs font-black mt-0.5", RANK_BADGES[1])}>2nd</p>
          <p className="text-[10px] font-semibold tabular-nums text-text-secondary mt-1">{top3[1] && getValue(top3[1])}</p>
        </div>

        {/* 1st place */}
        <div className={cn(
          "flex-1 rounded-xl border bg-gradient-to-b p-4 text-center -mt-4",
          PODIUM_COLORS[0],
          top3[0]?.isUser && "ring-2 ring-accent",
        )}>
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary text-base font-bold">
            {top3[0]?.name.charAt(0)}
          </div>
          <p className="text-xs font-bold text-text-primary truncate">{top3[0]?.name}</p>
          <p className={cn("text-sm font-black mt-0.5", RANK_BADGES[0])}>1st</p>
          <p className="text-xs font-semibold tabular-nums text-text-secondary mt-1">{top3[0] && getValue(top3[0])}</p>
        </div>

        {/* 3rd place */}
        <div className={cn(
          "flex-1 rounded-xl border bg-gradient-to-b p-3 text-center",
          PODIUM_COLORS[2],
          top3[2]?.isUser && "ring-2 ring-accent",
        )}>
          <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-sm font-bold">
            {top3[2]?.name.charAt(0)}
          </div>
          <p className="text-[10px] font-bold text-text-secondary truncate">{top3[2]?.name}</p>
          <p className={cn("text-xs font-black mt-0.5", RANK_BADGES[2])}>3rd</p>
          <p className="text-[10px] font-semibold tabular-nums text-text-secondary mt-1">{top3[2] && getValue(top3[2])}</p>
        </div>
      </div>

      {/* Your stats card */}
      <div className="mx-4 mt-4 rounded-2xl border border-accent/20 bg-accent-bg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase text-text-muted">Your Rank</p>
            <p className="text-2xl font-black text-accent">#{userRank}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[9px] uppercase text-text-muted">Balance</p>
              <p className="text-sm font-bold tabular-nums">{formatCurrency(balance)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase text-text-muted">Win Rate</p>
              <p className="text-sm font-bold">{(winRate * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase text-text-muted">Streak</p>
              <p className="text-sm font-bold">{bestStreak}W</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of leaderboard */}
      <div className="mt-4 divide-y divide-border">
        {rest.map((entry) => (
          <div
            key={entry.name}
            className={cn(
              "flex items-center justify-between px-4 py-3 transition-colors",
              entry.isUser && "bg-accent/5",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 text-xs font-black tabular-nums text-text-muted">
                #{entry.rank}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-tertiary text-xs font-bold text-text-secondary">
                {entry.name.charAt(0)}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  entry.isUser && "text-accent font-bold",
                )}>
                  {entry.name}
                </p>
                <p className="text-[10px] text-text-muted">
                  {entry.trades} trades · {(entry.winRate * 100).toFixed(0)}% win
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums">
              {getValue(entry)}
            </span>
          </div>
        ))}
      </div>

      {/* Daily challenge history */}
      {pastResults.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="text-sm font-semibold mb-2">Daily Challenge History</h2>
          <div className="space-y-2">
            {pastResults.slice(0, 5).map((r) => (
              <div
                key={r.date}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{r.date}</p>
                  <p className="text-[10px] text-text-muted">
                    {r.tradesWon}/{r.totalTrades} won
                  </p>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  r.totalPnl >= 0 ? "text-profit" : "text-loss",
                )}>
                  {r.totalPnl >= 0 ? "+" : ""}{formatCurrency(r.totalPnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mx-4 mt-6 rounded-xl border border-border bg-surface-secondary/50 p-3 text-center">
        <p className="text-[10px] text-text-muted">
          Simulated competitors. Sign in to compete with real players when multiplayer launches.
        </p>
      </div>
    </main>
  );
}
