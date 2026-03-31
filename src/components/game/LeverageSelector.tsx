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
    <div className="flex items-center gap-1" role="group" aria-label="Leverage selector">
      {LEVERAGE_OPTIONS.map((lev) => (
        <button
          key={lev}
          onClick={() => onChange(lev)}
          disabled={disabled}
          aria-label={`${lev}x leverage`}
          aria-pressed={value === lev}
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-bold transition-all",
            value === lev
              ? "bg-accent text-white"
              : "bg-surface-tertiary text-text-muted",
            disabled && "opacity-50",
          )}
        >
          {lev}x
        </button>
      ))}
    </div>
  );
}
