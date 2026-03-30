"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { Candle } from "@/types/chart";
import { CANDLE_REVEAL_INTERVAL_MS } from "@/lib/game/constants";

interface ChartRevealProps {
  visibleCandles: Candle[];
  hiddenCandles: Candle[];
  revealing: boolean;
  onRevealComplete: () => void;
  entryPrice?: number;
}

function candleToLW(candle: Candle): CandlestickData<Time> {
  return {
    time: candle.time as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
}

export default function ChartReveal({
  visibleCandles,
  hiddenCandles,
  revealing,
  onRevealComplete,
  entryPrice,
}: ChartRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealIndexRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);

  // Initialize chart
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b40" },
        horzLines: { color: "#1e293b40" },
      },
      crosshair: {
        vertLine: { color: "#64748b60", width: 1, style: 3 },
        horzLine: { color: "#64748b60", width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: "#334155",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    series.setData(visibleCandles.map(candleToLW));

    // Draw entry price line if provided
    if (entryPrice) {
      series.createPriceLine({
        price: entryPrice,
        color: "#facc15",
        lineWidth: 1,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: "Entry",
      });
    }

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;
    revealIndexRef.current = 0;
    setRevealedCount(0);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // Only re-init when candle data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCandles, hiddenCandles]);

  const handleRevealComplete = useCallback(() => {
    onRevealComplete();
  }, [onRevealComplete]);

  // Handle reveal animation
  useEffect(() => {
    if (!revealing || !seriesRef.current) return;

    revealIndexRef.current = 0;

    intervalRef.current = setInterval(() => {
      const series = seriesRef.current;
      const chart = chartRef.current;
      if (!series || !chart) return;

      const idx = revealIndexRef.current;
      if (idx >= hiddenCandles.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        handleRevealComplete();
        return;
      }

      const candle = hiddenCandles[idx];
      series.update(candleToLW(candle));
      chart.timeScale().scrollToPosition(2, false);
      revealIndexRef.current++;
      setRevealedCount(revealIndexRef.current);
    }, CANDLE_REVEAL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [revealing, hiddenCandles, handleRevealComplete]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: 300 }}
      />
      {/* Reveal progress indicator */}
      {revealing && (
        <div className="absolute bottom-2 right-2 z-10 rounded-md bg-surface-secondary/80 px-2 py-1 text-xs text-text-muted backdrop-blur-sm">
          {revealedCount}/{hiddenCandles.length}
        </div>
      )}
    </div>
  );
}
