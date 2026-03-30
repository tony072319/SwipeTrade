"use client";

import { usePortfolioStore } from "@/stores/portfolio-store";
import { useDailyStore } from "@/stores/daily-store";
import { useHydration } from "@/hooks/useHydration";
import { formatCurrency, cn } from "@/lib/utils";

// Mock leaderboard entries for display
const MOCK_LEADERS = [
  { name: "CryptoKing", balance: 52340, winRate: 0.72, streak: 12 },
  { name: "TradeBot3000", balance: 41200, winRate: 0.68, streak: 8 },
  { name: "DiamondHands", balance: 38750, winRate: 0.65, streak: 15 },
  { name: "BullRunner", balance: 31400, winRate: 0.61, streak: 6 },
  { name: "ChartWhisper", balance: 28900, winRate: 0.59, streak: 9 },
  { name: "SwipeQueen", balance: 24100, winRate: 0.57, streak: 7 },
  { name: "MomentumTrader", balance: 21800, winRate: 0.55, streak: 5 },
  { name: "CandleReader", balance: 19500, winRate: 0.53, streak: 4 },
  { name: "PriceAction", balance: 17200, winRate: 0.52, streak: 3 },
  { name: "Rookie", balance: 14800, winRate: 0.50, streak: 2 },
];

function getRankBadge(rank: number) {
  if (rank === 1) return { emoji: "1st", color: "text-yellow-400" };
  if (rank === 2) return { emoji: "2nd", color: "text-gray-300" };
  if (rank === 3) return { emoji: "3rd", color: "text-amber-600" };
  return { emoji: `#${rank}`, color: "text-text-muted" };
}

export default function LeaderboardPage() {
  const hydrated = useHydration();
  const { balance, totalTrades, winningTrades, currentStreak, bestStreak } =
    usePortfolioStore();
  const { pastResults } = useDailyStore();

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  // Insert user into leaderboard
  const userEntry = {
    name: "You",
    balance: hydrated ? balance : 10000,
    winRate: hydrated ? winRate : 0,
    streak: hydrated ? currentStreak : 0,
    isUser: true,
  };

  const allEntries = [...MOCK_LEADERS.map((e) => ({ ...e, isUser: false })), userEntry]
    .sort((a, b) => b.balance - a.balance)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const userRank = allEntries.find((e) => e.isUser)?.rank ?? 0;

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh pb-20">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <p className="mt-0.5 text-xs text-text-muted">Compete with other traders</p>
      </div>

      {/* Your stats card */}
      <div className="mx-4 mt-4 rounded-2xl border border-accent/20 bg-accent-bg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Your Rank</p>
            <p className="text-3xl font-black text-accent">#{userRank}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Balance</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(balance)}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 border-t border-border/50 pt-3">
          <div>
            <span className="text-[10px] uppercase text-text-muted">Win Rate</span>
            <p className="text-sm font-bold">{(winRate * 100).toFixed(0)}%</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-text-muted">Trades</span>
            <p className="text-sm font-bold">{totalTrades}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-text-muted">Streak</span>
            <p className="text-sm font-bold">{currentStreak}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-text-muted">Best Streak</span>
            <p className="text-sm font-bold">{bestStreak}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="mt-6">
        <div className="px-4 pb-2">
          <h2 className="text-sm font-semibold">Top Traders</h2>
        </div>
        <div className="divide-y divide-border">
          {allEntries.map((entry) => {
            const badge = getRankBadge(entry.rank);
            return (
              <div
                key={entry.name}
                className={cn(
                  "flex items-center justify-between px-4 py-3 transition-colors",
                  entry.isUser && "bg-accent/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 text-sm font-black tabular-nums",
                    badge.color,
                  )}>
                    {badge.emoji}
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
                      {(entry.winRate * 100).toFixed(0)}% win rate
                      {entry.streak > 0 && ` · ${entry.streak} streak`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(entry.balance)}
                </span>
              </div>
            );
          })}
        </div>
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
        <p className="text-xs text-text-muted">
          Leaderboard shows simulated competitors. Sign in to compete with real players when multiplayer launches.
        </p>
      </div>
    </main>
  );
}
