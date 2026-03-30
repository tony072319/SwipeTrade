"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Trade } from "@/types/trade";
import { STARTING_BALANCE } from "@/lib/game/constants";

interface BalanceSparklineProps {
  trades: Trade[];
  width?: number;
  height?: number;
}

export default function BalanceSparkline({ trades, width = 120, height = 32 }: BalanceSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const points = useMemo(() => {
    if (trades.length === 0) return [];

    // Build balance history from trades (trades are newest first)
    const reversed = [...trades].reverse();
    const balances = [STARTING_BALANCE];
    let balance = STARTING_BALANCE;
    for (const t of reversed) {
      balance = Math.round((balance + t.pnl) * 100) / 100;
      balances.push(balance);
    }

    // Take last 30 points max
    return balances.slice(-30);
  }, [trades]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const padding = 2;

    ctx.clearRect(0, 0, width, height);

    // Draw line
    const lastPoint = points[points.length - 1];
    const isUp = lastPoint >= STARTING_BALANCE;

    ctx.beginPath();
    ctx.strokeStyle = isUp ? "#00dc82" : "#ff4757";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let i = 0; i < points.length; i++) {
      const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((points[i] - min) / range) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill gradient under the line
    const lastX = width - padding;
    const lastY = height - padding - ((lastPoint - min) / range) * (height - padding * 2);
    ctx.lineTo(lastX, height);
    ctx.lineTo(padding, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? "rgba(0, 220, 130, 0.15)" : "rgba(255, 71, 87, 0.15)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dot at the end
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? "#00dc82" : "#ff4757";
    ctx.fill();
  }, [points, width, height]);

  if (points.length < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height }}
      className="opacity-80"
    />
  );
}
