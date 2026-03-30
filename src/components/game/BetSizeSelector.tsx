"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface BetSizeSelectorProps {
  balance: number;
  betFraction: number;
  onChange: (fraction: number) => void;
}

const BET_OPTIONS = [
  { fraction: 0.05, label: "5%" },
  { fraction: 0.1, label: "10%" },
  { fraction: 0.25, label: "25%" },
  { fraction: 0.5, label: "50%" },
];

export default function BetSizeSelector({ balance, betFraction, onChange }: BetSizeSelectorProps) {
  const betAmount = Math.round(balance * betFraction * 100) / 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider text-text-muted">Bet</span>
      <div className="flex gap-0.5">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.fraction}
            onClick={() => onChange(opt.fraction)}
            className={cn(
              "rounded-md px-1.5 py-1 text-[10px] font-bold transition-all",
              betFraction === opt.fraction
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <span className="text-[10px] font-semibold tabular-nums text-text-secondary">
        {formatCurrency(betAmount)}
      </span>
    </div>
  );
}
