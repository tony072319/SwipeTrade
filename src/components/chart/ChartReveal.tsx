"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type HistogramData,
  type Time,
  ColorType,
  LineStyle,
  type LineWidth,
} from "lightweight-charts";
import type { Candle } from "@/types/chart";
import type { IndicatorData } from "@/types/chart";
import type { IndicatorId } from "@/stores/settings-store";
import { CANDLE_REVEAL_INTERVAL_MS } from "@/lib/game/constants";

interface ChartRevealProps {
  visibleCandles: Candle[];
  hiddenCandles: Candle[];
  revealing: boolean;
  onRevealComplete: () => void;
  entryPrice?: number;
  enabledIndicators?: IndicatorId[];
  visibleIndicatorData?: IndicatorData;
  hiddenIndicatorData?: IndicatorData;
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

function linePoint(time: number, value: number | null): LineData<Time> | null {
  if (value === null) return null;
  return { time: time as Time, value };
}

export default function ChartReveal({
  visibleCandles,
  hiddenCandles,
  revealing,
  onRevealComplete,
  entryPrice,
  enabledIndicators = [],
  visibleIndicatorData,
  hiddenIndicatorData,
}: ChartRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealIndexRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);

  // Track overlay indicator series
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  // Track pane indicator series
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const showRsi = enabledIndicators.includes("rsi");
  const showMacd = enabledIndicators.includes("macd");

  // Initialize chart
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chartOptions = {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b30" },
        horzLines: { color: "#1e293b30" },
      },
      crosshair: {
        vertLine: { color: "#64748b40", width: 1 as LineWidth, style: 3 },
        horzLine: { color: "#64748b40", width: 1 as LineWidth, style: 3 },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    };

    const chart = createChart(container, chartOptions);

    const series = chart.addCandlestickSeries({
      upColor: "#00dc82",
      downColor: "#ff4757",
      borderUpColor: "#00dc82",
      borderDownColor: "#ff4757",
      wickUpColor: "#00dc8280",
      wickDownColor: "#ff475780",
    });

    series.setData(visibleCandles.map(candleToLW));

    // Draw entry price line if provided
    if (entryPrice) {
      series.createPriceLine({
        price: entryPrice,
        color: "#fbbf24",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Entry",
      });
    }

    // Fit content first, then add right offset for hidden candles space
    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      rightOffset: hiddenCandles.length + 5,
    });

    // Add overlay indicator series (EMA, Bollinger)
    const newOverlaySeries = new Map<string, ISeriesApi<"Line">>();

    if (enabledIndicators.includes("ema9") && visibleIndicatorData?.ema9) {
      const ema9Series = chart.addLineSeries({
        color: "#fbbf24",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const data = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.ema9![i]))
        .filter((p): p is LineData<Time> => p !== null);
      ema9Series.setData(data);
      newOverlaySeries.set("ema9", ema9Series);
    }

    if (enabledIndicators.includes("ema21") && visibleIndicatorData?.ema21) {
      const ema21Series = chart.addLineSeries({
        color: "#f472b6",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const data = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.ema21![i]))
        .filter((p): p is LineData<Time> => p !== null);
      ema21Series.setData(data);
      newOverlaySeries.set("ema21", ema21Series);
    }

    if (enabledIndicators.includes("bollinger") && visibleIndicatorData?.bollinger) {
      const boll = visibleIndicatorData.bollinger;
      const upperSeries = chart.addLineSeries({
        color: "#a78bfa",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const lowerSeries = chart.addLineSeries({
        color: "#a78bfa",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const middleSeries = chart.addLineSeries({
        color: "#a78bfa50",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      upperSeries.setData(
        visibleCandles
          .map((c, i) => linePoint(c.time, boll.upper[i]))
          .filter((p): p is LineData<Time> => p !== null),
      );
      lowerSeries.setData(
        visibleCandles
          .map((c, i) => linePoint(c.time, boll.lower[i]))
          .filter((p): p is LineData<Time> => p !== null),
      );
      middleSeries.setData(
        visibleCandles
          .map((c, i) => linePoint(c.time, boll.middle[i]))
          .filter((p): p is LineData<Time> => p !== null),
      );

      newOverlaySeries.set("bollinger_upper", upperSeries);
      newOverlaySeries.set("bollinger_lower", lowerSeries);
      newOverlaySeries.set("bollinger_middle", middleSeries);
    }

    overlaySeriesRef.current = newOverlaySeries;
    chartRef.current = chart;
    seriesRef.current = series;
    revealIndexRef.current = 0;
    setRevealedCount(0);

    // RSI sub-chart
    let rsiChart: IChartApi | null = null;
    if (showRsi && rsiContainerRef.current && visibleIndicatorData?.rsi) {
      rsiChart = createChart(rsiContainerRef.current, {
        width: rsiContainerRef.current.clientWidth,
        height: 80,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#64748b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: "#1e293b20" },
          horzLines: { color: "#1e293b20" },
        },
        rightPriceScale: {
          borderColor: "#1e293b",
          scaleMargins: { top: 0.05, bottom: 0.05 },
        },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
        crosshair: {
          vertLine: { visible: false },
          horzLine: { color: "#64748b40", width: 1 as LineWidth, style: 3 },
        },
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: "#818cf8",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      // Add 30/70 reference lines
      rsiSeries.createPriceLine({ price: 70, color: "#ff475740", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
      rsiSeries.createPriceLine({ price: 30, color: "#00dc8240", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });

      const rsiData = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.rsi![i]))
        .filter((p): p is LineData<Time> => p !== null);
      rsiSeries.setData(rsiData);

      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;

      rsiChart.timeScale().fitContent();
      rsiChart.timeScale().applyOptions({
        rightOffset: hiddenCandles.length + 5,
      });
    }

    // MACD sub-chart
    let macdChart: IChartApi | null = null;
    if (showMacd && macdContainerRef.current && visibleIndicatorData?.macd) {
      macdChart = createChart(macdContainerRef.current, {
        width: macdContainerRef.current.clientWidth,
        height: 80,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#64748b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: "#1e293b20" },
          horzLines: { color: "#1e293b20" },
        },
        rightPriceScale: {
          borderColor: "#1e293b",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
        crosshair: {
          vertLine: { visible: false },
          horzLine: { color: "#64748b40", width: 1 as LineWidth, style: 3 },
        },
      });

      const macdHist = macdChart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const macdLine = macdChart.addLineSeries({
        color: "#22d3ee",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const macdSignal = macdChart.addLineSeries({
        color: "#f97316",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const macd = visibleIndicatorData.macd;
      const histData: HistogramData<Time>[] = [];
      for (let i = 0; i < visibleCandles.length; i++) {
        const v = macd.histogram[i];
        if (v !== null) {
          histData.push({ time: visibleCandles[i].time as Time, value: v, color: v >= 0 ? "#00dc8280" : "#ff475780" });
        }
      }
      macdHist.setData(histData);

      macdLine.setData(
        visibleCandles
          .map((c, i) => linePoint(c.time, macd.macd[i]))
          .filter((p): p is LineData<Time> => p !== null),
      );
      macdSignal.setData(
        visibleCandles
          .map((c, i) => linePoint(c.time, macd.signal[i]))
          .filter((p): p is LineData<Time> => p !== null),
      );

      macdChartRef.current = macdChart;
      macdLineSeriesRef.current = macdLine;
      macdSignalSeriesRef.current = macdSignal;
      macdHistSeriesRef.current = macdHist;

      macdChart.timeScale().fitContent();
      macdChart.timeScale().applyOptions({
        rightOffset: hiddenCandles.length + 5,
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (entry.target === container) {
          chart.applyOptions({ width, height });
        } else if (entry.target === rsiContainerRef.current && rsiChart) {
          rsiChart.applyOptions({ width });
        } else if (entry.target === macdContainerRef.current && macdChart) {
          macdChart.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(container);
    if (rsiContainerRef.current) resizeObserver.observe(rsiContainerRef.current);
    if (macdContainerRef.current) resizeObserver.observe(macdContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      chart.remove();
      rsiChart?.remove();
      macdChart?.remove();
      chartRef.current = null;
      rsiChartRef.current = null;
      macdChartRef.current = null;
      seriesRef.current = null;
      rsiSeriesRef.current = null;
      macdLineSeriesRef.current = null;
      macdSignalSeriesRef.current = null;
      macdHistSeriesRef.current = null;
      overlaySeriesRef.current = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCandles, hiddenCandles, enabledIndicators, visibleIndicatorData]);

  const handleRevealComplete = useCallback(() => {
    onRevealComplete();
  }, [onRevealComplete]);

  // Skip animation — reveal all remaining candles instantly
  const handleSkip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const series = seriesRef.current;
    if (!series) return;

    // Add all remaining candles
    for (let i = revealIndexRef.current; i < hiddenCandles.length; i++) {
      const candle = hiddenCandles[i];
      series.update(candleToLW(candle));

      // Update overlay indicators
      if (hiddenIndicatorData) {
        const overlays = overlaySeriesRef.current;
        if (hiddenIndicatorData.ema9?.[i] !== null && hiddenIndicatorData.ema9?.[i] !== undefined) {
          overlays.get("ema9")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema9[i]! });
        }
        if (hiddenIndicatorData.ema21?.[i] !== null && hiddenIndicatorData.ema21?.[i] !== undefined) {
          overlays.get("ema21")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema21[i]! });
        }
        if (hiddenIndicatorData.bollinger) {
          const b = hiddenIndicatorData.bollinger;
          if (b.upper[i] !== null) overlays.get("bollinger_upper")?.update({ time: candle.time as Time, value: b.upper[i]! });
          if (b.lower[i] !== null) overlays.get("bollinger_lower")?.update({ time: candle.time as Time, value: b.lower[i]! });
          if (b.middle[i] !== null) overlays.get("bollinger_middle")?.update({ time: candle.time as Time, value: b.middle[i]! });
        }
        if (hiddenIndicatorData.rsi?.[i] !== null && hiddenIndicatorData.rsi?.[i] !== undefined) {
          rsiSeriesRef.current?.update({ time: candle.time as Time, value: hiddenIndicatorData.rsi[i]! });
        }
        if (hiddenIndicatorData.macd) {
          const m = hiddenIndicatorData.macd;
          if (m.macd[i] !== null) macdLineSeriesRef.current?.update({ time: candle.time as Time, value: m.macd[i]! });
          if (m.signal[i] !== null) macdSignalSeriesRef.current?.update({ time: candle.time as Time, value: m.signal[i]! });
          if (m.histogram[i] !== null) {
            macdHistSeriesRef.current?.update({
              time: candle.time as Time,
              value: m.histogram[i]!,
              color: m.histogram[i]! >= 0 ? "#00dc8280" : "#ff475780",
            } as HistogramData<Time>);
          }
        }
      }
    }

    revealIndexRef.current = hiddenCandles.length;
    setRevealedCount(hiddenCandles.length);
    handleRevealComplete();
  }, [hiddenCandles, hiddenIndicatorData, handleRevealComplete]);

  // Handle reveal animation
  useEffect(() => {
    if (!revealing || !seriesRef.current) return;

    revealIndexRef.current = 0;

    intervalRef.current = setInterval(() => {
      const series = seriesRef.current;
      if (!series) return;

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

      // Update overlay indicator series
      if (hiddenIndicatorData) {
        const overlays = overlaySeriesRef.current;
        if (hiddenIndicatorData.ema9?.[idx] !== null && hiddenIndicatorData.ema9?.[idx] !== undefined) {
          overlays.get("ema9")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema9[idx]! });
        }
        if (hiddenIndicatorData.ema21?.[idx] !== null && hiddenIndicatorData.ema21?.[idx] !== undefined) {
          overlays.get("ema21")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema21[idx]! });
        }
        if (hiddenIndicatorData.bollinger) {
          const b = hiddenIndicatorData.bollinger;
          if (b.upper[idx] !== null) overlays.get("bollinger_upper")?.update({ time: candle.time as Time, value: b.upper[idx]! });
          if (b.lower[idx] !== null) overlays.get("bollinger_lower")?.update({ time: candle.time as Time, value: b.lower[idx]! });
          if (b.middle[idx] !== null) overlays.get("bollinger_middle")?.update({ time: candle.time as Time, value: b.middle[idx]! });
        }

        // Update pane indicators
        if (hiddenIndicatorData.rsi?.[idx] !== null && hiddenIndicatorData.rsi?.[idx] !== undefined) {
          rsiSeriesRef.current?.update({ time: candle.time as Time, value: hiddenIndicatorData.rsi[idx]! });
        }
        if (hiddenIndicatorData.macd) {
          const m = hiddenIndicatorData.macd;
          if (m.macd[idx] !== null) macdLineSeriesRef.current?.update({ time: candle.time as Time, value: m.macd[idx]! });
          if (m.signal[idx] !== null) macdSignalSeriesRef.current?.update({ time: candle.time as Time, value: m.signal[idx]! });
          if (m.histogram[idx] !== null) {
            macdHistSeriesRef.current?.update({
              time: candle.time as Time,
              value: m.histogram[idx]!,
              color: m.histogram[idx]! >= 0 ? "#00dc8280" : "#ff475780",
            } as HistogramData<Time>);
          }
        }
      }

      revealIndexRef.current++;
      setRevealedCount(revealIndexRef.current);
    }, CANDLE_REVEAL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [revealing, hiddenCandles, hiddenIndicatorData, handleRevealComplete]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={containerRef}
        className="w-full flex-1"
        style={{ minHeight: showRsi || showMacd ? 200 : 300 }}
      />
      {showRsi && (
        <div className="w-full border-t border-border/30">
          <div className="flex items-center gap-1 px-2 pt-1">
            <div className="h-2 w-2 rounded-full bg-[#818cf8]" />
            <span className="text-[9px] font-bold text-text-muted">RSI</span>
          </div>
          <div ref={rsiContainerRef} className="w-full" style={{ height: 80 }} />
        </div>
      )}
      {showMacd && (
        <div className="w-full border-t border-border/30">
          <div className="flex items-center gap-1 px-2 pt-1">
            <div className="h-2 w-2 rounded-full bg-[#22d3ee]" />
            <span className="text-[9px] font-bold text-text-muted">MACD</span>
          </div>
          <div ref={macdContainerRef} className="w-full" style={{ height: 80 }} />
        </div>
      )}
      {revealing && (
        <>
          <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            {revealedCount}/{hiddenCandles.length}
          </div>
          <button
            onClick={handleSkip}
            className="absolute bottom-3 left-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-bold text-white/80 backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            Skip →
          </button>
        </>
      )}
    </div>
  );
}
