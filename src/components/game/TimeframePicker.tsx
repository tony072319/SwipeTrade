"use client";

import type { TimeFrame, AssetType } from "@/types/chart";
import { TIMEFRAMES_BY_TYPE, TIMEFRAME_LABELS } from "@/lib/data/assets";
import { cn } from "@/lib/utils";

interface TimeframePickerProps {
  value: TimeFrame | null;
  onChange: (tf: TimeFrame | null) => void;
  assetType: AssetType | null; // null = both available
}

export default function TimeframePicker({
  value,
  onChange,
  assetType,
}: TimeframePickerProps) {
  const allTimeframes: TimeFrame[] = ["1m", "5m", "15m", "1h", "4h", "1D"];
  const availableTimeframes = assetType
    ? TIMEFRAMES_BY_TYPE[assetType]
    : allTimeframes;

  return (
    <div className="flex items-center gap-1">
      {/* Random option */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "rounded-md px-2 py-1 text-[10px] font-bold uppercase transition-all",
          !value
            ? "bg-accent text-white"
            : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
        )}
      >
        Auto
      </button>

      {availableTimeframes.map((tf) => {
        const isSelected = value === tf;
        return (
          <button
            key={tf}
            onClick={() => onChange(tf)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-bold transition-all",
              isSelected
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        );
      })}
    </div>
  );
}
