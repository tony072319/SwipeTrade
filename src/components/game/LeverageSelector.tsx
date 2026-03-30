"use client";

import { LEVERAGE_OPTIONS } from "@/lib/game/constants";
import { cn } from "@/lib/utils";

interface LeverageSelectorProps {
  value: number;
  onChange: (leverage: number) => void;
  disabled?: boolean;
}

export default function LeverageSelector({
  value,
  onChange,
  disabled = false,
}: LeverageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Lev</span>
      <div className="flex gap-1">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            onClick={() => onChange(lev)}
            disabled={disabled}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
              value === lev
                ? "bg-accent text-white shadow-sm shadow-accent/30"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary border border-transparent",
              disabled && "opacity-50",
            )}
          >
            {lev}x
          </button>
        ))}
      </div>
    </div>
  );
}
