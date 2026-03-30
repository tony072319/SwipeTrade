"use client";

import { type IndicatorId, useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";
import { useHydration } from "@/hooks/useHydration";

interface IndicatorOption {
  id: IndicatorId;
  label: string;
  description: string;
  color: string;
}

const INDICATORS: IndicatorOption[] = [
  { id: "volume", label: "Volume", description: "Trading volume bars", color: "#64748b" },
  { id: "ema9", label: "EMA 9", description: "Fast moving average", color: "#fbbf24" },
  { id: "ema21", label: "EMA 21", description: "Slow moving average", color: "#f472b6" },
  { id: "vwap", label: "VWAP", description: "Volume-weighted avg price", color: "#06b6d4" },
  { id: "rsi", label: "RSI", description: "Relative Strength Index", color: "#818cf8" },
  { id: "macd", label: "MACD", description: "Momentum indicator", color: "#22d3ee" },
  { id: "bollinger", label: "Bollinger", description: "Volatility bands", color: "#a78bfa" },
];

interface IndicatorSelectorProps {
  open: boolean;
  onClose: () => void;
}

export default function IndicatorSelector({ open, onClose }: IndicatorSelectorProps) {
  const hydrated = useHydration();
  const { enabledIndicators, toggleIndicator } = useSettingsStore();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-glass-border bg-surface-secondary animate-slide-up pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold">Indicators</h2>
          <p className="text-xs text-text-muted">Overlay on chart during gameplay</p>
        </div>

        <div className="space-y-2 px-4 pb-6">
          {INDICATORS.map((ind) => {
            const enabled = hydrated && enabledIndicators.includes(ind.id);
            return (
              <button
                key={ind.id}
                onClick={() => toggleIndicator(ind.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all",
                  enabled
                    ? "border-accent/20 bg-accent-bg"
                    : "border-border bg-surface-tertiary",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ind.color }}
                  />
                  <div className="text-left">
                    <p className={cn(
                      "text-sm font-bold",
                      enabled ? "text-accent" : "text-text-primary",
                    )}>
                      {ind.label}
                    </p>
                    <p className="text-[10px] text-text-muted">{ind.description}</p>
                  </div>
                </div>
                <div className={cn(
                  "h-5 w-9 rounded-full transition-colors",
                  enabled ? "bg-accent" : "bg-border",
                )}>
                  <div className={cn(
                    "h-5 w-5 rounded-full bg-white shadow transition-transform",
                    enabled ? "translate-x-4" : "translate-x-0",
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
