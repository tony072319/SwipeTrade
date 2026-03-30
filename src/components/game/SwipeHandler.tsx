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
  const progress = Math.min(Math.abs(deltaX) / 60, 1); // 0-1 progress toward threshold

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
            style={{ transform: `scale(${0.8 + progress * 0.2})` }}
          >
            <div className="flex items-center gap-3">
              {direction === "short" && (
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-loss">
                  <path d="M19 12H5M5 12l6-6M5 12l6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span
                className={cn(
                  "text-4xl font-black tracking-widest",
                  direction === "long" ? "text-profit" : "text-loss",
                )}
              >
                {direction === "long" ? "LONG" : "SHORT"}
              </span>
              {direction === "long" && (
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-profit">
                  <path d="M5 12h14M19 12l-6-6M19 12l-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Swipe progress indicator at edges */}
      {swiping && deltaX !== 0 && (
        <>
          {/* Edge glow line */}
          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5"
            style={{
              [deltaX > 0 ? "right" : "left"]: 0,
              opacity: opacity * 0.8,
              backgroundColor: deltaX > 0 ? "#00dc82" : "#ff4757",
              boxShadow: `0 0 30px 5px ${deltaX > 0 ? "#00dc8260" : "#ff475760"}`,
            }}
          />

          {/* Corner indicators */}
          <div
            className={cn(
              "pointer-events-none absolute top-3 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold",
              deltaX > 0 ? "right-3 bg-profit/20 text-profit" : "left-3 bg-loss/20 text-loss",
            )}
            style={{ opacity }}
          >
            {deltaX > 0 ? "LONG" : "SHORT"}
          </div>
        </>
      )}
    </div>
  );
}
