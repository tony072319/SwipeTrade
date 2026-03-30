"use client";

import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import TradeHistory from "@/components/portfolio/TradeHistory";
import EquityCurve from "@/components/portfolio/EquityCurve";
import PerformanceBreakdown from "@/components/portfolio/PerformanceBreakdown";
import AchievementsGrid from "@/components/portfolio/AchievementsGrid";
import WinRateChart from "@/components/portfolio/WinRateChart";
import ShareCard from "@/components/portfolio/ShareCard";
import PnlDistribution from "@/components/portfolio/PnlDistribution";
import DataExport from "@/components/portfolio/DataExport";
import WeeklySummary from "@/components/portfolio/WeeklySummary";
import SignInButton from "@/components/auth/SignInButton";
import { useSettingsStore, ACCENT_COLORS, DIFFICULTY_CONFIG, type AccentColor, type Difficulty } from "@/stores/settings-store";
import { formatCurrency, cn } from "@/lib/utils";

export default function ProfilePage() {
  const hydrated = useHydration();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    balance,
    trades,
    totalTrades,
    winningTrades,
    totalPnl,
    bestTrade,
    worstTrade,
    currentStreak,
    bestStreak,
    resetPortfolio,
  } = usePortfolioStore();

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
        {user ? (
          <div className="mt-1 flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            )}
            <p className="text-xs text-text-secondary">
              {user.user_metadata?.full_name ?? user.email}
            </p>
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-text-muted">Guest Account</p>
        )}
      </div>

      {/* Auth prompt for guests */}
      {!authLoading && !user && (
        <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface-secondary p-4 text-center">
          <p className="text-sm font-medium text-text-primary">
            Sign in to save your progress
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Sync across devices and compete on leaderboards
          </p>
          <div className="mt-3">
            <SignInButton size="sm" />
          </div>
        </div>
      )}

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
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <StatCard label="Trades" value={totalTrades.toString()} />
        <StatCard
          label="Win Rate"
          value={`${(winRate * 100).toFixed(1)}%`}
          color={winRate >= 0.5 ? "profit" : winRate > 0 ? "loss" : undefined}
        />
        <StatCard
          label="Profit Factor"
          value={(() => {
            const wins = trades.filter((t) => t.pnl > 0);
            const losses = trades.filter((t) => t.pnl < 0);
            const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
            const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
            if (totalLosses === 0) return wins.length > 0 ? "∞" : "-";
            return (totalWins / totalLosses).toFixed(2);
          })()}
          color={(() => {
            const wins = trades.filter((t) => t.pnl > 0);
            const losses = trades.filter((t) => t.pnl < 0);
            const totalWins = wins.reduce((s, t) => s + t.pnl, 0);
            const totalLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
            if (totalLosses === 0) return wins.length > 0 ? "profit" as const : undefined;
            return totalWins / totalLosses >= 1 ? "profit" as const : "loss" as const;
          })()}
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
          label="Avg Trade"
          value={totalTrades > 0 ? `${totalPnl / totalTrades >= 0 ? "+" : ""}${formatCurrency(totalPnl / totalTrades)}` : "-"}
          color={totalTrades > 0 ? (totalPnl >= 0 ? "profit" : "loss") : undefined}
        />
        <StatCard
          label="Streak"
          value={currentStreak > 0 ? `${currentStreak}W` : "0"}
          color={currentStreak >= 3 ? "profit" : undefined}
        />
        <StatCard
          label="Best Streak"
          value={bestStreak > 0 ? `${bestStreak}W` : "0"}
          color={bestStreak >= 5 ? "profit" : undefined}
        />
        <StatCard
          label="Long/Short"
          value={(() => {
            const longs = trades.filter((t) => t.direction === "long").length;
            const shorts = trades.filter((t) => t.direction === "short").length;
            return totalTrades > 0 ? `${longs}/${shorts}` : "-";
          })()}
        />
      </div>

      {/* Weekly summary */}
      <WeeklySummary trades={trades} />

      {/* Equity curve */}
      <EquityCurve trades={trades} />

      {/* Win rate trend */}
      <WinRateChart trades={trades} />

      {/* P&L distribution */}
      <PnlDistribution trades={trades} />

      {/* Performance by asset */}
      <PerformanceBreakdown trades={trades} />

      {/* Achievements */}
      <AchievementsGrid />

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

      {/* Share card */}
      <ShareCard />

      {/* Settings */}
      <SettingsSection />

      {/* Data export/import */}
      <DataExport />

      {/* Actions */}
      <div className="mx-4 mt-6 space-y-3 pb-4">
        {totalTrades > 0 && (
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset your portfolio to $10,000? This cannot be undone.",
                )
              ) {
                resetPortfolio();
              }
            }}
            className="w-full rounded-xl border border-loss/30 py-3 text-sm font-medium text-loss transition-colors hover:bg-loss/10"
          >
            Reset Portfolio
          </button>
        )}

        {user && (
          <button
            onClick={signOut}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
          >
            Sign Out
          </button>
        )}
      </div>
    </main>
  );
}

function SettingsSection() {
  const { soundEnabled, revealSpeed, accentColor, difficulty, setSoundEnabled, setRevealSpeed, setAccentColor, setDifficulty } = useSettingsStore();

  return (
    <div className="mx-4 mt-6">
      <h2 className="text-sm font-semibold text-text-primary mb-3">Settings</h2>
      <div className="space-y-2">
        {/* Sound toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3">
          <div>
            <p className="text-sm font-medium">Sound Effects</p>
            <p className="text-[10px] text-text-muted">Play sounds on trades and swipes</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "h-6 w-11 rounded-full transition-colors",
              soundEnabled ? "bg-accent" : "bg-border",
            )}
          >
            <div className={cn(
              "h-6 w-6 rounded-full bg-white shadow transition-transform",
              soundEnabled ? "translate-x-5" : "translate-x-0",
            )} />
          </button>
        </div>

        {/* Reveal speed */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3">
          <div>
            <p className="text-sm font-medium">Reveal Speed</p>
            <p className="text-[10px] text-text-muted">Candle animation speed</p>
          </div>
          <div className="flex gap-1">
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setRevealSpeed(s)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition-all",
                  revealSpeed === s
                    ? "bg-accent text-white"
                    : "bg-surface-tertiary text-text-muted",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3">
          <div>
            <p className="text-sm font-medium">Accent Color</p>
            <p className="text-[10px] text-text-muted">Customize app theme</p>
          </div>
          <div className="flex gap-1.5">
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  accentColor === color && "ring-2 ring-white ring-offset-2 ring-offset-surface-secondary",
                )}
                style={{ backgroundColor: ACCENT_COLORS[color] }}
              />
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3">
          <div>
            <p className="text-sm font-medium">Difficulty</p>
            <p className="text-[10px] text-text-muted">{DIFFICULTY_CONFIG[difficulty].desc}</p>
          </div>
          <div className="flex gap-1">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition-all",
                  difficulty === d
                    ? "bg-accent text-white"
                    : "bg-surface-tertiary text-text-muted",
                )}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset tutorial */}
        <button
          onClick={() => {
            localStorage.removeItem("swipetrade-tutorial-seen");
            alert("Tutorial will show next time you open Play.");
          }}
          className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-left"
        >
          <p className="text-sm font-medium">Replay Tutorial</p>
          <p className="text-[10px] text-text-muted">Show the onboarding guide again</p>
        </button>
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-surface-secondary p-2.5">
      <p className="text-[9px] uppercase text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-bold tabular-nums truncate",
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
