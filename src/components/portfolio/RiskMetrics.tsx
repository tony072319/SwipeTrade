"use client";

import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import { STARTING_BALANCE } from "@/lib/game/constants";
import { formatCurrency, cn } from "@/lib/utils";

interface RiskMetricsProps {
  trades: Trade[];
}

export default function RiskMetrics({ trades }: RiskMetricsProps) {
  const metrics = useMemo(() => {
    if (trades.length < 5) return null;

    // Build balance history (trades are newest first)
    const reversed = [...trades].reverse();
    let balance = STARTING_BALANCE;
    const balances = [balance];
    const pnls: number[] = [];

    for (const t of reversed) {
      balance = Math.round((balance + t.pnl) * 100) / 100;
      balances.push(balance);
      pnls.push(t.pnl);
    }

    // Max drawdown
    let peak = balances[0];
    let maxDrawdown = 0;
    for (const b of balances) {
      if (b > peak) peak = b;
      const drawdown = (peak - b) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Average P&L and std deviation
    const avgPnl = pnls.reduce((s, v) => s + v, 0) / pnls.length;
    const variance = pnls.reduce((s, v) => s + (v - avgPnl) ** 2, 0) / pnls.length;
    const stdDev = Math.sqrt(variance);

    // Sharpe-like ratio (avg / stdDev)
    const sharpe = stdDev > 0 ? avgPnl / stdDev : 0;

    // Expectancy (avg win * win rate - avg loss * loss rate)
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p <= 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0;
    const winRate = wins.length / pnls.length;
    const expectancy = avgWin * winRate - avgLoss * (1 - winRate);

    // Recovery factor (total P&L / max drawdown amount)
    const totalPnl = pnls.reduce((s, v) => s + v, 0);
    const maxDrawdownAmount = maxDrawdown * peak;
    const recoveryFactor = maxDrawdownAmount > 0 ? totalPnl / maxDrawdownAmount : 0;

    return {
      maxDrawdown,
      sharpe,
      expectancy,
      avgWin,
      avgLoss,
      recoveryFactor,
      stdDev,
    };
  }, [trades]);

  if (!metrics) return null;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Risk Metrics</h2>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Max Drawdown"
          value={`${(metrics.maxDrawdown * 100).toFixed(1)}%`}
          color={metrics.maxDrawdown > 0.3 ? "loss" : metrics.maxDrawdown > 0.15 ? "warning" : "profit"}
          desc="Largest peak-to-trough decline"
        />
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpe.toFixed(2)}
          color={metrics.sharpe > 0.5 ? "profit" : metrics.sharpe > 0 ? "warning" : "loss"}
          desc="Return per unit of risk"
        />
        <MetricCard
          label="Expectancy"
          value={`${metrics.expectancy >= 0 ? "+" : ""}${formatCurrency(metrics.expectancy)}`}
          color={metrics.expectancy > 0 ? "profit" : "loss"}
          desc="Expected $ per trade"
        />
        <MetricCard
          label="Avg Win / Loss"
          value={`${formatCurrency(metrics.avgWin)} / ${formatCurrency(metrics.avgLoss)}`}
          color={metrics.avgWin > metrics.avgLoss ? "profit" : "loss"}
          desc="Average winning vs losing trade"
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  desc,
}: {
  label: string;
  value: string;
  color: "profit" | "loss" | "warning";
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-2.5">
      <p className="text-[9px] uppercase text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-bold tabular-nums truncate",
          color === "profit" && "text-profit",
          color === "loss" && "text-loss",
          color === "warning" && "text-yellow-500",
        )}
      >
        {value}
      </p>
      <p className="text-[8px] text-text-muted/50 mt-0.5">{desc}</p>
    </div>
  );
}
