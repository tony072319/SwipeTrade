"use client";

import { usePortfolioStore } from "@/stores/portfolio-store";

export default function TradeExport() {
  const trades = usePortfolioStore((s) => s.trades);

  const handleExport = () => {
    if (trades.length === 0) return;

    const headers = ["Date", "Asset", "Direction", "Leverage", "Entry", "Exit", "Bet", "P&L", "Timeframe"];
    const rows = trades.map((t) => [
      new Date(t.createdAt).toLocaleString(),
      t.asset,
      t.direction.toUpperCase(),
      `${t.leverage}x`,
      t.entryPrice.toFixed(2),
      t.exitPrice.toFixed(2),
      t.betAmount.toFixed(2),
      t.pnl >= 0 ? `+${t.pnl.toFixed(2)}` : t.pnl.toFixed(2),
      t.timeframe,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swipetrade-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (trades.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-xs font-bold text-text-muted transition-colors hover:text-text-secondary hover:border-accent/30"
    >
      Export CSV
    </button>
  );
}
