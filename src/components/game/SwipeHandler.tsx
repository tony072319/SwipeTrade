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

  const opacity = Math.min(Math.abs(deltaX) / 120, 1);

  return (
    <div ref={ref} className="relative h-full w-full select-none">
      {children}

      {/* Directional overlay */}
      {swiping && direction && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity",
            direction === "long"
              ? "bg-profit/5"
              : "bg-loss/5",
          )}
          style={{ opacity }}
        >
          <div
            className={cn(
              "rounded-2xl px-8 py-4 text-3xl font-black tracking-wider",
              direction === "long"
                ? "bg-profit/20 text-profit"
                : "bg-loss/20 text-loss",
            )}
          >
            {direction === "long" ? "LONG >" : "< SHORT"}
          </div>
        </div>
      )}

      {/* Swipe hint arrows at edges */}
      {enabled && !swiping && (
        <>
          <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-loss/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
            </svg>
          </div>
          <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-profit/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
