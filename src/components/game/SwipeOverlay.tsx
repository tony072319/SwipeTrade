"use client";

import { cn } from "@/lib/utils";

interface SwipeOverlayProps {
  direction: "long" | "short" | null;
  intensity: number; // 0 to 1
}

export default function SwipeOverlay({ direction, intensity }: SwipeOverlayProps) {
  if (!direction || intensity < 0.1) return null;

  const opacity = Math.min(intensity * 0.6, 0.5);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
      {/* Directional gradient */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity",
          direction === "long"
            ? "bg-gradient-to-r from-transparent via-transparent to-profit/20"
            : "bg-gradient-to-l from-transparent via-transparent to-loss/20",
        )}
        style={{ opacity }}
      />

      {/* Direction label */}
      <div
        className={cn(
          "rounded-2xl px-8 py-4 backdrop-blur-sm transition-all",
          direction === "long"
            ? "bg-profit/20 border border-profit/30"
            : "bg-loss/20 border border-loss/30",
        )}
        style={{
          opacity: intensity > 0.3 ? Math.min((intensity - 0.3) * 2, 1) : 0,
          transform: `scale(${0.8 + intensity * 0.2})`,
        }}
      >
        <p
          className={cn(
            "text-2xl font-black",
            direction === "long" ? "text-profit" : "text-loss",
          )}
        >
          {direction === "long" ? "LONG →" : "← SHORT"}
        </p>
      </div>
    </div>
  );
}
