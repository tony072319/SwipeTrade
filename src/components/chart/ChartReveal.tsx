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
  revealSpeed?: 1 | 2 | 4;
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
  revealSpeed = 1,
}: ChartRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const revealIndexRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Track overlay indicator series
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  // Track pane indicator series
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const showRsi = enabledIndicators.includes("rsi");
  const showMacd = enabledIndicators.includes("macd");

  // Initialize chart
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const gridColor = isLight ? "#94a3b820" : "#1e293b30";
    const borderColor = isLight ? "#cbd5e1" : "#1e293b";
    const textColor = isLight ? "#64748b" : "#64748b";
    const crosshairColor = isLight ? "#47556940" : "#64748b40";

    const chartOptions = {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: { color: crosshairColor, width: 1 as LineWidth, style: 3 },
        horzLine: { color: crosshairColor, width: 1 as LineWidth, style: 3 },
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      timeScale: {
        borderColor,
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
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "▶ ENTRY",
      });
    }

    // Add vertical marker at the decision point (last visible candle)
    if (visibleCandles.length > 0) {
      const lastVisible = visibleCandles[visibleCandles.length - 1];
      series.setMarkers([
        {
          time: lastVisible.time as Time,
          position: "aboveBar",
          color: "#fbbf24",
          shape: "arrowDown",
          text: "Decision",
        },
      ]);
    }

    // Fit content first, then add right offset for hidden candles space
    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      rightOffset: hiddenCandles.length + 5,
    });

    // Add volume histogram if enabled
    if (enabledIndicators.includes("volume") && visibleIndicatorData?.volume) {
      const volumeSeries = chart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      const volData: HistogramData<Time>[] = [];
      for (let i = 0; i < visibleCandles.length; i++) {
        const v = visibleIndicatorData.volume[i];
        if (v !== null && v !== undefined) {
          const isUp = visibleCandles[i].close >= visibleCandles[i].open;
          volData.push({
            time: visibleCandles[i].time as Time,
            value: v,
            color: isUp ? "#00dc8240" : "#ff475740",
          });
        }
      }
      volumeSeries.setData(volData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Add overlay indicator series (EMA, Bollinger)
    const newOverlaySeries = new Map<string, ISeriesApi<"Line">>();

    if (enabledIndicators.includes("vwap") && visibleIndicatorData?.vwap) {
      const vwapSeries = chart.addLineSeries({
        color: "#06b6d4",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const data = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.vwap![i]))
        .filter((p): p is LineData<Time> => p !== null);
      vwapSeries.setData(data);
      newOverlaySeries.set("vwap", vwapSeries);
    }

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

    if (enabledIndicators.includes("sma50") && visibleIndicatorData?.sma50) {
      const sma50Series = chart.addLineSeries({
        color: "#34d399",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const data = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.sma50![i]))
        .filter((p): p is LineData<Time> => p !== null);
      sma50Series.setData(data);
      newOverlaySeries.set("sma50", sma50Series);
    }

    if (enabledIndicators.includes("sma200") && visibleIndicatorData?.sma200) {
      const sma200Series = chart.addLineSeries({
        color: "#f87171",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const data = visibleCandles
        .map((c, i) => linePoint(c.time, visibleIndicatorData.sma200![i]))
        .filter((p): p is LineData<Time> => p !== null);
      sma200Series.setData(data);
      newOverlaySeries.set("sma200", sma200Series);
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
          textColor,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: isLight ? "#94a3b815" : "#1e293b20" },
          horzLines: { color: isLight ? "#94a3b815" : "#1e293b20" },
        },
        rightPriceScale: {
          borderColor,
          scaleMargins: { top: 0.05, bottom: 0.05 },
        },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
        crosshair: {
          vertLine: { visible: false },
          horzLine: { color: crosshairColor, width: 1 as LineWidth, style: 3 },
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
          textColor,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: isLight ? "#94a3b815" : "#1e293b20" },
          horzLines: { color: isLight ? "#94a3b815" : "#1e293b20" },
        },
        rightPriceScale: {
          borderColor,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
        crosshair: {
          vertLine: { visible: false },
          horzLine: { color: crosshairColor, width: 1 as LineWidth, style: 3 },
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
      volumeSeriesRef.current = null;
      overlaySeriesRef.current = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCandles, hiddenCandles, enabledIndicators, visibleIndicatorData]);

  const handleRevealComplete = useCallback(() => {
    onRevealComplete();
  }, [onRevealComplete]);

  // Reveal a single candle + all its indicators
  const revealCandle = useCallback((idx: number) => {
    const series = seriesRef.current;
    if (!series) return;

    const candle = hiddenCandles[idx];
    series.update(candleToLW(candle));

    // Update volume
    if (hiddenIndicatorData?.volume?.[idx] !== null && hiddenIndicatorData?.volume?.[idx] !== undefined) {
      const isUp = candle.close >= candle.open;
      volumeSeriesRef.current?.update({
        time: candle.time as Time,
        value: hiddenIndicatorData.volume[idx]!,
        color: isUp ? "#00dc8240" : "#ff475740",
      } as HistogramData<Time>);
    }

    // Update overlay indicator series
    if (hiddenIndicatorData) {
      const overlays = overlaySeriesRef.current;
      if (hiddenIndicatorData.vwap?.[idx] !== null && hiddenIndicatorData.vwap?.[idx] !== undefined) {
        overlays.get("vwap")?.update({ time: candle.time as Time, value: hiddenIndicatorData.vwap[idx]! });
      }
      if (hiddenIndicatorData.ema9?.[idx] !== null && hiddenIndicatorData.ema9?.[idx] !== undefined) {
        overlays.get("ema9")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema9[idx]! });
      }
      if (hiddenIndicatorData.ema21?.[idx] !== null && hiddenIndicatorData.ema21?.[idx] !== undefined) {
        overlays.get("ema21")?.update({ time: candle.time as Time, value: hiddenIndicatorData.ema21[idx]! });
      }
      if (hiddenIndicatorData.sma50?.[idx] !== null && hiddenIndicatorData.sma50?.[idx] !== undefined) {
        overlays.get("sma50")?.update({ time: candle.time as Time, value: hiddenIndicatorData.sma50[idx]! });
      }
      if (hiddenIndicatorData.sma200?.[idx] !== null && hiddenIndicatorData.sma200?.[idx] !== undefined) {
        overlays.get("sma200")?.update({ time: candle.time as Time, value: hiddenIndicatorData.sma200[idx]! });
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

    setCurrentPrice(candle.close);
  }, [hiddenCandles, hiddenIndicatorData]);

  // Skip animation — reveal all remaining candles instantly
  const handleSkip = useCallback(() => {
    const series = seriesRef.current;
    if (!series) return;

    for (let i = revealIndexRef.current; i < hiddenCandles.length; i++) {
      revealCandle(i);
    }

    revealIndexRef.current = hiddenCandles.length;
    setRevealedCount(hiddenCandles.length);
    handleRevealComplete();
  }, [hiddenCandles, revealCandle, handleRevealComplete]);

  // Handle reveal animation with requestAnimationFrame for smoother pacing
  useEffect(() => {
    if (!revealing || !seriesRef.current) return;

    revealIndexRef.current = 0;
    const intervalMs = CANDLE_REVEAL_INTERVAL_MS / revealSpeed;
    let lastTime = 0;
    let rafId: number;

    function tick(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= intervalMs) {
        lastTime = timestamp;

        const idx = revealIndexRef.current;
        if (idx >= hiddenCandles.length) {
          handleRevealComplete();
          return;
        }

        revealCandle(idx);
        revealIndexRef.current++;
        setRevealedCount(revealIndexRef.current);

        // Auto-scroll chart to keep revealed candles in view
        chartRef.current?.timeScale().scrollToPosition(-2, false);
        rsiChartRef.current?.timeScale().scrollToPosition(-2, false);
        macdChartRef.current?.timeScale().scrollToPosition(-2, false);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [revealing, hiddenCandles, hiddenIndicatorData, handleRevealComplete, revealSpeed, revealCandle]);

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
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            {currentPrice !== null && entryPrice && (() => {
              const pnlPct = ((currentPrice - entryPrice) / entryPrice) * 100;
              const isUp = currentPrice >= entryPrice;
              return (
                <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 backdrop-blur-md border ${
                  isUp ? "bg-profit/15 border-profit/30" : "bg-loss/15 border-loss/30"
                }`}>
                  <span className={`text-xs font-bold tabular-nums ${isUp ? "text-profit" : "text-loss"}`}>
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] font-bold tabular-nums ${isUp ? "text-profit/70" : "text-loss/70"}`}>
                    {isUp ? "+" : ""}{pnlPct.toFixed(2)}%
                  </span>
                </div>
              );
            })()}
            <span className="rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md border border-white/10">
              {revealedCount}/{hiddenCandles.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10 h-0.5 bg-black/20">
            <div
              className="h-full bg-accent transition-all duration-200 ease-out"
              style={{ width: `${(revealedCount / hiddenCandles.length) * 100}%` }}
            />
          </div>
          <button
            onClick={handleSkip}
            className="absolute bottom-3 left-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-bold text-white/80 backdrop-blur-md border border-white/10 transition-all hover:bg-black/80 hover:border-white/20"
          >
            Skip →
          </button>
        </>
      )}
    </div>
  );
}
