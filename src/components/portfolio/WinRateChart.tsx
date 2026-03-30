"use client";

import { useRef, useEffect } from "react";
import type { Trade } from "@/types/trade";

interface WinRateChartProps {
  trades: Trade[];
}

export default function WinRateChart({ trades }: WinRateChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trades.length < 5) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 12, bottom: 24, left: 32 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Compute rolling win rate (window of 5 trades)
    const chronological = [...trades].reverse();
    const windowSize = Math.min(5, Math.floor(chronological.length / 2));
    const points: number[] = [];

    for (let i = windowSize - 1; i < chronological.length; i++) {
      let wins = 0;
      for (let j = i - windowSize + 1; j <= i; j++) {
        if (chronological[j].pnl > 0) wins++;
      }
      points.push(wins / windowSize);
    }

    if (points.length < 2) return;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const gridLines = [0, 0.25, 0.5, 0.75, 1];
    for (const v of gridLines) {
      const y = padding.top + chartH * (1 - v);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px system-ui";
    ctx.textAlign = "right";
    for (const v of [0, 50, 100]) {
      const y = padding.top + chartH * (1 - v / 100);
      ctx.fillText(`${v}%`, padding.left - 4, y + 3);
    }

    // 50% reference line (emphasized)
    const y50 = padding.top + chartH * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, y50);
    ctx.lineTo(w - padding.right, y50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Win rate line
    const xStep = chartW / (points.length - 1);

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    const lastRate = points[points.length - 1];
    if (lastRate >= 0.5) {
      gradient.addColorStop(0, "rgba(0, 220, 130, 0.2)");
      gradient.addColorStop(1, "rgba(0, 220, 130, 0.0)");
    } else {
      gradient.addColorStop(0, "rgba(255, 71, 87, 0.0)");
      gradient.addColorStop(1, "rgba(255, 71, 87, 0.2)");
    }

    // Fill area
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    for (let i = 0; i < points.length; i++) {
      const x = padding.left + i * xStep;
      const y = padding.top + chartH * (1 - points[i]);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(padding.left + (points.length - 1) * xStep, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = padding.left + i * xStep;
      const y = padding.top + chartH * (1 - points[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lastRate >= 0.5 ? "#00dc82" : "#ff4757";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current value dot
    const lastX = padding.left + (points.length - 1) * xStep;
    const lastY = padding.top + chartH * (1 - lastRate);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lastRate >= 0.5 ? "#00dc82" : "#ff4757";
    ctx.fill();

    // Current value label
    ctx.fillStyle = lastRate >= 0.5 ? "#00dc82" : "#ff4757";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`${(lastRate * 100).toFixed(0)}%`, lastX - 8, lastY - 8);
  }, [trades]);

  if (trades.length < 5) return null;

  return (
    <div className="mx-4 mt-4">
      <h2 className="text-sm font-semibold text-text-primary mb-2">Win Rate Trend</h2>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 120 }}
        />
      </div>
    </div>
  );
}
