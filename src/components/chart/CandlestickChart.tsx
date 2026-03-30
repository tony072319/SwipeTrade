"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
} from "lightweight-charts";
import type { Candle } from "@/types/chart";

interface CandlestickChartProps {
  candles: Candle[];
  autoFit?: boolean;
  onReady?: (api: {
    chart: IChartApi;
    series: ISeriesApi<"Candlestick">;
  }) => void;
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

export default function CandlestickChart({
  candles,
  autoFit = true,
  onReady,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const handleReady = useCallback(
    (chart: IChartApi, series: ISeriesApi<"Candlestick">) => {
      onReady?.({ chart, series });
    },
    [onReady],
  );

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

    series.setData(candles.map(candleToLW));

    if (autoFit) {
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
    seriesRef.current = series;

    handleReady(chart, series);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [candles, autoFit, handleReady]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: 300 }}
    />
  );
}
