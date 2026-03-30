"use client";

import { useState, useCallback } from "react";
import type { ChartData } from "@/types/chart";

interface FetchChartParams {
  asset?: string;
  timeframe?: string;
}

export function useChart() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async (params?: FetchChartParams) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params?.asset) searchParams.set("asset", params.asset);
      if (params?.timeframe) searchParams.set("timeframe", params.timeframe);

      const query = searchParams.toString();
      const url = `/api/charts${query ? `?${query}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch chart");
      }
      const data: ChartData = await res.json();
      setChart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { chart, loading, error, fetchChart };
}
