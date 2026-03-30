"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

// Generate realistic-looking price data
function generateTickerData(): TickerItem[] {
  const stocks: { symbol: string; basePrice: number }[] = [
    { symbol: "AAPL", basePrice: 178 },
    { symbol: "MSFT", basePrice: 415 },
    { symbol: "GOOGL", basePrice: 155 },
    { symbol: "AMZN", basePrice: 185 },
    { symbol: "NVDA", basePrice: 875 },
    { symbol: "TSLA", basePrice: 245 },
    { symbol: "META", basePrice: 505 },
    { symbol: "BTC", basePrice: 67500 },
    { symbol: "ETH", basePrice: 3450 },
    { symbol: "SOL", basePrice: 145 },
    { symbol: "SPY", basePrice: 515 },
    { symbol: "QQQ", basePrice: 445 },
    { symbol: "AMD", basePrice: 165 },
    { symbol: "NFLX", basePrice: 625 },
    { symbol: "JPM", basePrice: 198 },
  ];

  return stocks.map(({ symbol, basePrice }) => {
    const changePct = (Math.random() - 0.48) * 4; // slight upward bias
    const price = basePrice * (1 + changePct / 100);
    return {
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(changePct * 100) / 100,
    };
  });
}

function formatTickerPrice(price: number): string {
  if (price >= 10000) return price.toFixed(0);
  if (price >= 100) return price.toFixed(2);
  return price.toFixed(2);
}

export default function PriceTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(generateTickerData());
    // Refresh prices every 30 seconds for a dynamic feel
    const interval = setInterval(() => {
      setItems(generateTickerData());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let scrollPos = 0;
    const speed = 0.5; // px per frame

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth / 2) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [items]);

  if (items.length === 0) return null;

  // Duplicate items for infinite scroll effect
  const tickerItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b border-border/50 bg-surface/80 backdrop-blur-sm">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 whitespace-nowrap overflow-hidden py-1 px-2"
        style={{ scrollBehavior: "auto" }}
      >
        {tickerItems.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-text-secondary">{item.symbol}</span>
            <span className="text-[10px] font-mono tabular-nums text-text-primary">
              ${formatTickerPrice(item.price)}
            </span>
            <span className={cn(
              "text-[9px] font-bold tabular-nums",
              item.change >= 0 ? "text-profit" : "text-loss",
            )}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
