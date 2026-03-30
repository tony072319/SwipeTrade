"use client";

import { useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WatchlistAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  sparkline: number[];
}

// Generate deterministic-looking daily data
function generateWatchlist(): WatchlistAsset[] {
  const day = new Date().getDate();
  const assets = [
    { symbol: "BTC", name: "Bitcoin", base: 67500 },
    { symbol: "ETH", name: "Ethereum", base: 3450 },
    { symbol: "AAPL", name: "Apple", base: 178 },
    { symbol: "NVDA", name: "NVIDIA", base: 875 },
    { symbol: "TSLA", name: "Tesla", base: 245 },
    { symbol: "SOL", name: "Solana", base: 145 },
    { symbol: "SPY", name: "S&P 500", base: 515 },
    { symbol: "MSFT", name: "Microsoft", base: 415 },
  ];

  return assets.map(({ symbol, name, base }, idx) => {
    // Use day + index as seed for deterministic-ish data
    const seed = day * 31 + idx * 7;
    const changePct = ((Math.sin(seed) * 100) % 5) - 1.5;
    const price = base * (1 + changePct / 100);

    // Generate sparkline (20 points)
    const sparkline: number[] = [];
    let p = base * 0.99;
    for (let i = 0; i < 20; i++) {
      const noise = Math.sin(seed + i * 0.7) * base * 0.005;
      p += noise + (changePct > 0 ? base * 0.001 : -base * 0.001);
      sparkline.push(p);
    }

    return {
      symbol,
      name,
      price: Math.round(price * 100) / 100,
      change: Math.round(changePct * 100) / 100,
      sparkline,
    };
  });
}

function MiniSparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = isUp ? "#00dc82" : "#ff4757";
    ctx.lineWidth = 1.5;

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data, isUp]);

  return <canvas ref={canvasRef} width={60} height={24} className="opacity-80" />;
}

function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return p.toFixed(2);
}

export default function Watchlist() {
  const assets = useMemo(() => generateWatchlist(), []);

  return (
    <div className="border-t border-border px-6 py-8">
      <h2 className="text-center text-lg font-bold mb-1">Market Watch</h2>
      <p className="text-center text-[10px] text-text-muted mb-4">Popular assets you can trade</p>

      <div className="max-w-sm mx-auto space-y-1">
        {assets.map((asset) => {
          const isUp = asset.change >= 0;
          return (
            <div
              key={asset.symbol}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-surface-secondary/30 px-3 py-2 hover:bg-surface-secondary/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div>
                  <p className="text-xs font-bold text-text-primary">{asset.symbol}</p>
                  <p className="text-[9px] text-text-muted truncate">{asset.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniSparkline data={asset.sparkline} isUp={isUp} />
                <div className="text-right min-w-[4.5rem]">
                  <p className="text-xs font-mono font-bold tabular-nums text-text-primary">
                    ${formatPrice(asset.price)}
                  </p>
                  <p className={cn(
                    "text-[9px] font-bold tabular-nums",
                    isUp ? "text-profit" : "text-loss",
                  )}>
                    {isUp ? "+" : ""}{asset.change}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
