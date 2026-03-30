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
      <span className="text-xs font-medium text-text-secondary">Leverage</span>
      <div className="flex gap-1">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            onClick={() => onChange(lev)}
            disabled={disabled}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              value === lev
                ? "bg-text-primary text-surface"
                : "bg-surface-secondary text-text-secondary hover:text-text-primary",
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
