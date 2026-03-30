"use client";

import { useRef, useEffect, useMemo } from "react";
import type { Trade } from "@/types/trade";

interface PnlDistributionProps {
  trades: Trade[];
}

export default function PnlDistribution({ trades }: PnlDistributionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const buckets = useMemo(() => {
    if (trades.length < 5) return null;

    // Create P&L distribution buckets
    const pnls = trades.map((t) => t.pnl);
    const min = Math.min(...pnls);
    const max = Math.max(...pnls);
    const range = max - min;
    if (range === 0) return null;

    const numBuckets = 12;
    const bucketSize = range / numBuckets;
    const counts = new Array(numBuckets).fill(0);
    const starts = new Array(numBuckets).fill(0);

    for (let i = 0; i < numBuckets; i++) {
      starts[i] = min + i * bucketSize;
    }

    for (const pnl of pnls) {
      let idx = Math.floor((pnl - min) / bucketSize);
      if (idx >= numBuckets) idx = numBuckets - 1;
      counts[idx]++;
    }

    return { counts, starts, bucketSize, max: Math.max(...counts) };
  }, [trades]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buckets) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 8, right: 8, bottom: 20, left: 8 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const barWidth = chartW / buckets.counts.length - 2;

    for (let i = 0; i < buckets.counts.length; i++) {
      const count = buckets.counts[i];
      const barH = buckets.max > 0 ? (count / buckets.max) * chartH : 0;
      const x = padding.left + (chartW / buckets.counts.length) * i + 1;
      const y = padding.top + chartH - barH;

      const midValue = buckets.starts[i] + buckets.bucketSize / 2;
      const isProfit = midValue >= 0;

      ctx.fillStyle = isProfit ? "rgba(0, 220, 130, 0.6)" : "rgba(255, 71, 87, 0.6)";
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Count label on tall bars
      if (count > 0 && barH > 14) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(count.toString(), x + barWidth / 2, y + 10);
      }
    }

    // Zero line
    const zeroIdx = Math.floor((0 - buckets.starts[0]) / buckets.bucketSize);
    if (zeroIdx >= 0 && zeroIdx < buckets.counts.length) {
      const zeroX = padding.left + (chartW / buckets.counts.length) * zeroIdx;
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(zeroX, padding.top);
      ctx.lineTo(zeroX, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "8px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("$0", zeroX, h - 4);
    }

    // X axis labels
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "7px system-ui";
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(buckets.counts.length / 4));
    for (let i = 0; i < buckets.counts.length; i += labelStep) {
      const val = buckets.starts[i];
      const x = padding.left + (chartW / buckets.counts.length) * i + barWidth / 2;
      ctx.fillText(`$${Math.round(val)}`, x, h - 4);
    }
  }, [buckets]);

  if (!buckets || trades.length < 5) return null;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">P&L Distribution</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 100 }}
        />
      </div>
    </div>
  );
}
