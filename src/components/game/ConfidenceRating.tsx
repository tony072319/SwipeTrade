"use client";

import { useState, useEffect, useMemo } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useHydration } from "@/hooks/useHydration";
import { cn } from "@/lib/utils";

const CONFIDENCE_KEY = "swipetrade-confidence-log";

interface ConfidenceEntry {
  confidence: number;
  won: boolean;
}

interface ConfidenceRatingProps {
  onRate: (confidence: number) => void;
  value: number;
}

// Confidence multipliers for bet sizing
export const CONFIDENCE_MULTIPLIER: Record<number, number> = {
  1: 0.5,  // Low — half bet
  2: 1.0,  // Med — normal bet
  3: 1.5,  // High — 1.5x bet
};

export function ConfidenceRating({ onRate, value }: ConfidenceRatingProps) {
  const levels = [
    { value: 1, label: "Low", hint: "0.5x bet", color: "text-loss" },
    { value: 2, label: "Med", hint: "1x bet", color: "text-text-secondary" },
    { value: 3, label: "High", hint: "1.5x bet", color: "text-profit" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-text-muted">Conf</span>
      <div className="flex gap-0.5">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => onRate(l.value)}
            aria-label={`${l.label} confidence — ${l.hint}`}
            title={l.hint}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-bold transition-all",
              value === l.value
                ? l.value === 1 ? "bg-loss/80 text-white" : l.value === 3 ? "bg-profit/80 text-white" : "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:bg-surface-tertiary/80",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Confidence calibration chart shown in profile
export function ConfidenceCalibration() {
  const hydrated = useHydration();
  const [entries, setEntries] = useState<ConfidenceEntry[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIDENCE_KEY) || "[]");
      setEntries(saved);
    } catch {
      // ignore
    }
  }, [hydrated]);

  const stats = useMemo(() => {
    if (entries.length < 5) return null;

    const byLevel = [1, 2, 3].map((level) => {
      const filtered = entries.filter((e) => e.confidence === level);
      const wins = filtered.filter((e) => e.won).length;
      return {
        level,
        count: filtered.length,
        winRate: filtered.length > 0 ? wins / filtered.length : 0,
      };
    });

    return byLevel;
  }, [entries]);

  if (!stats) return null;

  const labels = ["Low", "Medium", "High"];

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Confidence Calibration</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={s.level} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-text-muted w-14">{labels[i]}</span>
              <div className="flex-1 h-4 rounded-full bg-surface-tertiary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    s.winRate >= 0.5 ? "bg-profit" : "bg-loss",
                  )}
                  style={{ width: `${s.winRate * 100}%` }}
                />
              </div>
              <span className={cn(
                "text-[10px] font-bold tabular-nums w-10 text-right",
                s.winRate >= 0.5 ? "text-profit" : "text-loss",
              )}>
                {s.count > 0 ? `${(s.winRate * 100).toFixed(0)}%` : "-"}
              </span>
              <span className="text-[8px] text-text-muted w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[9px] text-text-muted text-center">
          Win rate by confidence level — are you well-calibrated?
        </p>
      </div>
    </div>
  );
}

// Helper to log a confidence entry
export function logConfidence(confidence: number, won: boolean) {
  try {
    const entries: ConfidenceEntry[] = JSON.parse(localStorage.getItem(CONFIDENCE_KEY) || "[]");
    entries.push({ confidence, won });
    // Keep last 200
    localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(entries.slice(-200)));
  } catch {
    // ignore
  }
}
