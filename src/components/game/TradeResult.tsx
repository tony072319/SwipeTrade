"use client";

import { useEffect, useState } from "react";
import type { TradeResult as TradeResultType } from "@/types/trade";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { playWinSound, playLossSound } from "@/lib/sounds";

interface TradeResultProps {
  result: TradeResultType;
  balance: number;
  onNext: () => void;
}

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#00dc82", "#6366f1", "#fbbf24", "#f472b6", "#22d3ee"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className="absolute top-0 h-2 w-2 rounded-full"
      style={{
        left: `${x}%`,
        backgroundColor: color,
        animation: `confetti-fall 1.2s ease-out ${delay}s forwards`,
        opacity: 0.8,
      }}
    />
  );
}

function getStreakMessage(streak: number): string | null {
  if (streak >= 10) return "UNSTOPPABLE! 10+ streak!";
  if (streak >= 7) return "ON FIRE! 7 in a row!";
  if (streak >= 5) return "HOT STREAK! 5 wins!";
  if (streak >= 3) return "Nice streak! 3 wins!";
  return null;
}

export default function TradeResult({
  result,
  balance,
  onNext,
}: TradeResultProps) {
  const [animatedPnl, setAnimatedPnl] = useState(0);
  const [visible, setVisible] = useState(false);
  const currentStreak = usePortfolioStore((s) => s.currentStreak);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    // Haptic + sound feedback on result
    if (navigator.vibrate) {
      navigator.vibrate(result.isWin ? [50, 30, 50] : [100]);
    }
    if (result.isWin) playWinSound();
    else playLossSound();
    return () => clearTimeout(t);
  }, [result.isWin]);

  useEffect(() => {
    const duration = 500;
    const steps = 25;
    const increment = result.pnl / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setAnimatedPnl(result.pnl);
        clearInterval(interval);
      } else {
        setAnimatedPnl(current);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [result.pnl]);

  const streakMessage = result.isWin ? getStreakMessage(currentStreak) : null;
  const showBigConfetti = result.isWin && currentStreak >= 5;

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Confetti for wins */}
      {result.isWin && visible && (
        <div className="pointer-events-none absolute inset-x-0 top-1/4 h-20 overflow-hidden">
          {Array.from({ length: showBigConfetti ? 40 : 20 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={Math.random() * 0.5}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}

      {/* Extra confetti burst for big streaks */}
      {showBigConfetti && visible && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={`extra-${i}`}
              delay={Math.random() * 0.8}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}

      <div className={cn(
        "mx-4 w-full max-w-sm rounded-2xl border bg-surface-secondary p-6 shadow-2xl",
        visible && "animate-scale-in",
        result.isWin ? "border-profit/20" : "border-loss/20",
      )}>
        {/* Streak banner */}
        {streakMessage && (
          <div className="mb-3 -mx-6 -mt-6 rounded-t-2xl bg-gradient-to-r from-profit/20 via-accent/20 to-profit/20 px-4 py-2.5 text-center">
            <p className="text-sm font-black text-profit animate-pulse">
              {currentStreak >= 5 ? "🔥 " : ""}{streakMessage}{currentStreak >= 5 ? " 🔥" : ""}
            </p>
          </div>
        )}

        {/* Direction + leverage badge */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider",
              result.direction === "long"
                ? "bg-profit-bg text-profit"
                : "bg-loss-bg text-loss",
            )}
          >
            {result.direction}
          </span>
          <span className="rounded-lg bg-surface-tertiary px-3 py-1 text-xs font-bold text-text-secondary">
            {result.leverage}x
          </span>
        </div>

        {/* P&L display */}
        <div className="mb-5 text-center">
          <p
            className={cn(
              "text-5xl font-black tabular-nums tracking-tight",
              result.isWin ? "text-profit" : "text-loss",
            )}
          >
            {result.pnl >= 0 ? "+" : ""}
            {formatCurrency(animatedPnl)}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              result.isWin ? "text-profit/60" : "text-loss/60",
            )}
          >
            {formatPercent(result.pnlPercent)}
          </p>
        </div>

        {/* Trade details */}
        <div className="mb-5 space-y-2 rounded-xl bg-surface/50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Entry</span>
            <span className="font-mono font-medium text-text-primary">
              {formatCurrency(result.entryPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Exit</span>
            <span className="font-mono font-medium text-text-primary">
              {formatCurrency(result.exitPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Bet</span>
            <span className="font-mono font-medium text-text-primary">
              {formatCurrency(result.betAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Price Move</span>
            <span className={cn(
              "font-mono font-medium",
              result.pnlPercent >= 0 ? "text-profit" : "text-loss",
            )}>
              {result.pnlPercent >= 0 ? "+" : ""}{(((result.exitPrice - result.entryPrice) / result.entryPrice) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-text-muted">Balance</span>
            <span className="font-mono font-bold text-text-primary">
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const text = `SwipeTrade: ${result.direction.toUpperCase()} ${result.leverage}x → ${result.isWin ? "WIN" : "LOSS"} ${result.pnl >= 0 ? "+" : ""}${formatCurrency(result.pnl)} (${formatPercent(result.pnlPercent)})`;
              if (navigator.share) {
                navigator.share({ text }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text).catch(() => {});
              }
            }}
            className="rounded-xl border border-border bg-surface-tertiary py-3.5 px-4 text-sm font-bold text-text-secondary transition-all hover:bg-surface-tertiary/80"
            title="Share result"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="flex-1 rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Next Trade
          </button>
        </div>
      </div>
    </div>
  );
}
