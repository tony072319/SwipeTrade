"use client";

import { useState, useEffect } from "react";

const CURRENT_VERSION = "1.3.0";

const UPDATES = [
  "Trading Quiz: 10-question test on Learn page",
  "Market Sentiment: Bullish/Bearish/Neutral indicator on charts",
  "Streak Milestones: Special celebrations at 3, 5, 7, 10+ wins",
  "Trade Details: Tap trades in history for full breakdown",
  "Session Recap: See your last session stats when you return",
  "Quick Stats: Tap balance in play mode for instant overview",
  "Performance Breakdown: Analyze by asset, timeframe, or direction",
  "Daily Challenge: Progressive difficulty (rounds get harder)",
  "Improved Swipe: Better visual feedback with arrows",
  "Accessibility: Reduced motion support, keyboard focus styles",
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
