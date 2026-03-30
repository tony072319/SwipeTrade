"use client";

import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import TradeHistory from "@/components/portfolio/TradeHistory";
import { formatCurrency, cn } from "@/lib/utils";
import { STARTING_BALANCE } from "@/lib/game/constants";

export default function ProfilePage() {
  const hydrated = useHydration();
  const { balance, trades, totalTrades, winningTrades, totalPnl, bestTrade, worstTrade, currentStreak, resetPortfolio } =
    usePortfolioStore();

  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center pb-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-muted border-t-text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh pb-20">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="mt-0.5 text-xs text-text-muted">Guest Account</p>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface-secondary p-5">
        <p className="text-xs uppercase text-text-muted">Portfolio Value</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-text-primary">
          {formatCurrency(balance)}
        </p>
        <p
          className={cn(
            "mt-1 text-sm font-medium tabular-nums",
            totalPnl >= 0 ? "text-profit" : "text-loss",
          )}
        >
          {totalPnl >= 0 ? "+" : ""}
          {formatCurrency(totalPnl)} all time
        </p>
      </div>

      {/* Stats grid */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Total Trades" value={totalTrades.toString()} />
        <StatCard
          label="Win Rate"
          value={`${(winRate * 100).toFixed(1)}%`}
          color={winRate >= 0.5 ? "profit" : winRate > 0 ? "loss" : undefined}
        />
        <StatCard
          label="Best Trade"
          value={bestTrade > 0 ? `+${formatCurrency(bestTrade)}` : "-"}
          color={bestTrade > 0 ? "profit" : undefined}
        />
        <StatCard
          label="Worst Trade"
          value={worstTrade < 0 ? formatCurrency(worstTrade) : "-"}
          color={worstTrade < 0 ? "loss" : undefined}
        />
        <StatCard
          label="Current Streak"
          value={currentStreak > 0 ? `${currentStreak}W` : "0"}
          color={currentStreak >= 3 ? "profit" : undefined}
        />
        <StatCard
          label="Wins / Losses"
          value={`${winningTrades} / ${totalTrades - winningTrades}`}
        />
      </div>

      {/* Trade history */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 pb-2">
          <h2 className="text-sm font-semibold text-text-primary">
            Trade History
          </h2>
          <span className="text-xs text-text-muted">
            Last {trades.length} trades
          </span>
        </div>
        <TradeHistory trades={trades} />
      </div>

      {/* Reset button */}
      {totalTrades > 0 && (
        <div className="mx-4 mt-6 pb-4">
          <button
            onClick={() => {
              if (confirm("Reset your portfolio to $10,000? This cannot be undone.")) {
                resetPortfolio();
              }
            }}
            className="w-full rounded-xl border border-loss/30 py-3 text-sm font-medium text-loss transition-colors hover:bg-loss/10"
          >
            Reset Portfolio
          </button>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "profit" | "loss";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-3">
      <p className="text-[10px] uppercase text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tabular-nums",
          color === "profit" && "text-profit",
          color === "loss" && "text-loss",
          !color && "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
