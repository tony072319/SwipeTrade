"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { Direction } from "@/types/trade";

interface SwipeState {
  swiping: boolean;
  deltaX: number;
  direction: Direction | null;
}

interface UseSwipeOptions {
  threshold?: number;
  enabled?: boolean;
  onSwipe?: (direction: Direction) => void;
}

export function useSwipe({
  threshold = 50,
  enabled = true,
  onSwipe,
}: UseSwipeOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const swipedRef = useRef(false);
  const [state, setState] = useState<SwipeState>({
    swiping: false,
    deltaX: 0,
    direction: null,
  });

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      swipedRef.current = false;
      setState({ swiping: false, deltaX: 0, direction: null });
    },
    [enabled],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || swipedRef.current) return;
      const deltaX = e.touches[0].clientX - startXRef.current;
      const deltaY = e.touches[0].clientY - startYRef.current;

      // Ignore if vertical movement dominates
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) return;

      // Prevent vertical scroll when swiping horizontally
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
      }

      const direction: Direction | null =
        deltaX > threshold / 2
          ? "long"
          : deltaX < -threshold / 2
            ? "short"
            : null;

      setState({ swiping: true, deltaX, direction });
    },
    [enabled, threshold],
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || swipedRef.current) return;

    setState((prev) => {
      if (Math.abs(prev.deltaX) >= threshold && prev.direction) {
        swipedRef.current = true;
        onSwipe?.(prev.direction);
        return { ...prev, swiping: false };
      }
      return { swiping: false, deltaX: 0, direction: null };
    });
  }, [enabled, threshold, onSwipe]);

  // Mouse support for desktop
  const mouseDownRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      mouseDownRef.current = true;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      swipedRef.current = false;
      setState({ swiping: false, deltaX: 0, direction: null });
    },
    [enabled],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !mouseDownRef.current || swipedRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      const direction: Direction | null =
        deltaX > threshold / 2
          ? "long"
          : deltaX < -threshold / 2
            ? "short"
            : null;
      setState({ swiping: true, deltaX, direction });
    },
    [enabled, threshold],
  );

  const handleMouseUp = useCallback(() => {
    if (!enabled || !mouseDownRef.current) return;
    mouseDownRef.current = false;
    handleTouchEnd();
  }, [enabled, handleTouchEnd]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseUp);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  ]);

  return { ref: elementRef, ...state };
}
