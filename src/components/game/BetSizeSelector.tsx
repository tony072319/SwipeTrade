"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface BetSizeSelectorProps {
  balance: number;
  betFraction: number;
  leverage?: number;
  onChange: (fraction: number) => void;
}

const BET_OPTIONS = [
  { fraction: 0.1, label: "10%" },
  { fraction: 0.25, label: "25%" },
  { fraction: 0.5, label: "50%" },
];

export default function BetSizeSelector({ balance, betFraction, leverage = 1, onChange }: BetSizeSelectorProps) {
  const betAmount = Math.round(balance * betFraction * 100) / 100;
  const isHighRisk = betFraction * leverage >= 0.5;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-0.5">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.fraction}
            onClick={() => onChange(opt.fraction)}
            aria-label={`Bet ${opt.label} of balance`}
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold transition-all",
              betFraction === opt.fraction
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <span className={cn(
        "text-[9px] font-bold tabular-nums",
        isHighRisk ? "text-loss" : "text-text-muted",
      )}>
        {formatCurrency(betAmount)}
      </span>
    </div>
  );
}
