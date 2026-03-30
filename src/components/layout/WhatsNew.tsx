"use client";

import { useState, useEffect } from "react";

const CURRENT_VERSION = "1.5.0";

const UPDATES = [
  "100+ Assets: Telecom, real estate, materials, transport & growth stocks",
  "VWAP Indicator: Volume-weighted average price overlay",
  "Volume Default: Volume bars now enabled by default",
  "ETF Tab: Dedicated ETF category in asset picker",
  "12 Challenge Scenarios: ETF, gold, healthcare, energy, DeFi & more",
  "Data Reliability: Retry logic for Yahoo Finance & CoinGecko APIs",
  "Better Caching: Smarter server-side caching with TTL",
  "Keyboard Shortcuts: Arrow keys / S/L to trade, Space for next",
  "Skip Animation: Fast-forward reveal with the Skip button",
  "Confidence Tracking: Rate your confidence and track calibration",
];

export default function WhatsNew() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("swipetrade-whats-new");
    if (seen !== CURRENT_VERSION) {
      // Only show if they've used the app before
      const hasTrades = localStorage.getItem("swipetrade-portfolio");
      if (hasTrades) {
        setOpen(true);
      }
      localStorage.setItem("swipetrade-whats-new", CURRENT_VERSION);
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-accent/20 bg-surface-secondary p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">What&apos;s New</p>
          <h2 className="text-xl font-black mt-1">SwipeTrade v{CURRENT_VERSION}</h2>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {UPDATES.map((update, i) => (
            <div key={i} className="flex gap-2 text-xs text-text-secondary">
              <span className="text-accent shrink-0">+</span>
              {update}
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Let&apos;s Go!
        </button>
      </div>
    </div>
  );
}
