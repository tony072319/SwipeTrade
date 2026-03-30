"use client";

import { useEffect, useRef } from "react";
import type { Trade } from "@/types/trade";
import { STARTING_BALANCE } from "@/lib/game/constants";

interface EquityCurveProps {
  trades: Trade[];
}

export default function EquityCurve({ trades }: EquityCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trades.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 10, bottom: 20, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Build equity data points (most recent trades first in array, reverse)
    const reversedTrades = [...trades].reverse();
    const points: number[] = [STARTING_BALANCE];
    let bal = STARTING_BALANCE;
    for (const t of reversedTrades) {
      bal += t.pnl;
      points.push(bal);
    }

    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const range = maxVal - minVal || 1;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "#1e293b40";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Label
      const val = maxVal - (range * i) / 4;
      ctx.fillStyle = "#64748b";
      ctx.font = "10px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`$${Math.round(val).toLocaleString()}`, padding.left - 4, y + 3);
    }

    // Draw line
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = padding.left + (i / (points.length - 1)) * chartW;
      const y = padding.top + ((maxVal - points[i]) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const lastVal = points[points.length - 1];
    const isProfit = lastVal >= STARTING_BALANCE;
    ctx.strokeStyle = isProfit ? "#00dc82" : "#ff4757";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gradient fill
    const lastX = padding.left + chartW;
    const gradientY = padding.top + ((maxVal - STARTING_BALANCE) / range) * chartH;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, isProfit ? "#00dc8215" : "#ff475715");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Starting balance reference line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padding.left, gradientY);
    ctx.lineTo(w - padding.right, gradientY);
    ctx.strokeStyle = "#64748b40";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Trade count label
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${points.length - 1} trades`, w / 2, h - 4);
  }, [trades]);

  if (trades.length < 2) return null;

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface-secondary p-3">
      <p className="mb-2 text-xs font-semibold text-text-muted uppercase">Equity Curve</p>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 120 }}
      />
    </div>
  );
}
