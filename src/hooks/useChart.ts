"use client";

import { useState, useCallback, useRef } from "react";
import type { ChartData } from "@/types/chart";

interface FetchChartParams {
  asset?: string;
  timeframe?: string;
  visible?: number;
  hidden?: number;
}

function buildUrl(params?: FetchChartParams): string {
  const searchParams = new URLSearchParams();
  if (params?.asset) searchParams.set("asset", params.asset);
  if (params?.timeframe) searchParams.set("timeframe", params.timeframe);
  if (params?.visible) searchParams.set("visible", params.visible.toString());
  if (params?.hidden) searchParams.set("hidden", params.hidden.toString());
  const query = searchParams.toString();
  return `/api/charts${query ? `?${query}` : ""}`;
}

function isValidChart(data: unknown): data is ChartData {
  if (!data || typeof data !== "object") return false;
  const d = data as ChartData;
  return (
    d.asset != null &&
    Array.isArray(d.visibleCandles) &&
    d.visibleCandles.length > 0 &&
    Array.isArray(d.hiddenCandles) &&
    d.hiddenCandles.length > 0
  );
}

export function useChart() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefetchRef = useRef<Promise<ChartData | null> | null>(null);
  const lastParamsRef = useRef<FetchChartParams | undefined>(undefined);

  const fetchChart = useCallback(async (params?: FetchChartParams) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      // Check if we have a prefetched chart ready
      if (prefetchRef.current) {
        const prefetched = prefetchRef.current;
        prefetchRef.current = null;
        try {
          const data = await prefetched;
          if (isValidChart(data)) {
            setChart(data);
            setLoading(false);
            return;
          }
          // Invalid prefetch data, fall through to normal fetch
        } catch {
          // Prefetch failed, fall through to normal fetch
        }
      }

      const url = buildUrl(params);
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch chart");
      }
      const data: ChartData = await res.json();
      if (!isValidChart(data)) {
        throw new Error("Invalid chart data received");
      }
      setChart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Start prefetching the next chart in background
  const prefetchNext = useCallback((params?: FetchChartParams) => {
    const url = buildUrl(params ?? lastParamsRef.current);
    prefetchRef.current = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Prefetch failed");
        return res.json() as Promise<ChartData>;
      })
      .catch(() => {
        prefetchRef.current = null;
        return null;
      });
  }, []);

  return { chart, loading, error, fetchChart, prefetchNext };
}
