"use client";

import type { ReactNode } from "react";
import { useSwipe } from "@/hooks/useSwipe";
import type { Direction } from "@/types/trade";
import { cn } from "@/lib/utils";

interface SwipeHandlerProps {
  enabled: boolean;
  onSwipe: (direction: Direction) => void;
  children: ReactNode;
}

export default function SwipeHandler({
  enabled,
  onSwipe,
  children,
}: SwipeHandlerProps) {
  const { ref, swiping, deltaX, direction } = useSwipe({
    enabled,
    onSwipe,
    threshold: 60,
  });

  const opacity = Math.min(Math.abs(deltaX) / 100, 1);

  return (
    <div ref={ref} className="relative h-full w-full select-none">
      {children}

      {/* Directional overlay */}
      {swiping && direction && (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-fade-in"
          style={{ opacity }}
        >
          {/* Background glow */}
          <div
            className={cn(
              "absolute inset-0",
              direction === "long"
                ? "bg-gradient-to-r from-transparent via-profit/5 to-profit/10"
                : "bg-gradient-to-l from-transparent via-loss/5 to-loss/10",
            )}
          />

          {/* Direction label */}
          <div
            className={cn(
              "relative rounded-2xl px-10 py-5 animate-scale-in",
              direction === "long"
                ? "bg-profit/15 border border-profit/30"
                : "bg-loss/15 border border-loss/30",
            )}
          >
            <span
              className={cn(
                "text-4xl font-black tracking-widest",
                direction === "long" ? "text-profit" : "text-loss",
              )}
            >
              {direction === "long" ? "LONG" : "SHORT"}
            </span>
          </div>
        </div>
      )}

      {/* Edge glow lines */}
      {swiping && deltaX !== 0 && (
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5"
          style={{
            [deltaX > 0 ? "right" : "left"]: 0,
            opacity: opacity * 0.8,
            backgroundColor: deltaX > 0 ? "#00dc82" : "#ff4757",
            boxShadow: `0 0 30px 5px ${deltaX > 0 ? "#00dc8260" : "#ff475760"}`,
          }}
        />
      )}
    </div>
  );
}
