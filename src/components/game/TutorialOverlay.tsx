"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to SwipeTrade!",
    description: "Practice reading candlestick charts and predicting price movements.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <path d="M12 20v-6M6 20V10M18 20V4" />
      </svg>
    ),
  },
  {
    title: "Read the Chart",
    description: "You'll see a candlestick chart. Green candles = price went up. Red candles = price went down. Study the pattern.",
    icon: (
      <div className="flex items-end gap-1">
        <div className="w-3 h-6 bg-profit rounded-sm" />
        <div className="w-3 h-10 bg-loss rounded-sm" />
        <div className="w-3 h-4 bg-profit rounded-sm" />
        <div className="w-3 h-8 bg-profit rounded-sm" />
        <div className="w-3 h-5 bg-loss rounded-sm" />
      </div>
    ),
  },
  {
    title: "Swipe to Trade",
    description: "Swipe RIGHT or tap LONG if you think the price will go up. Swipe LEFT or tap SHORT if you think it will go down.",
    icon: (
      <div className="flex items-center gap-4 text-2xl font-black">
        <span className="text-loss">← SHORT</span>
        <span className="text-profit">LONG →</span>
      </div>
    ),
  },
  {
    title: "Watch the Reveal",
    description: "After you swipe, hidden candles animate in. Watch the price move and see if your prediction was right!",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Build Your Portfolio",
    description: "Start with $10,000. Each trade bets 10% of your balance. Use leverage for bigger risk/reward. Try the Daily Challenge!",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-profit">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const isLast = step === TUTORIAL_STEPS.length - 1;
  const current = TUTORIAL_STEPS[step];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className={cn(
        "mx-6 w-full max-w-sm rounded-2xl border border-glass-border bg-surface-secondary p-6 text-center",
        visible && "animate-scale-in",
      )}>
        {/* Step indicator */}
        <div className="mb-4 flex justify-center gap-1.5">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-accent" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="mb-4 flex justify-center">{current.icon}</div>

        {/* Content */}
        <h2 className="text-xl font-black">{current.title}</h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {current.description}
        </p>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-text-secondary transition-all hover:bg-surface-tertiary"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            {isLast ? "Start Trading!" : "Next"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={onComplete}
            className="mt-3 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Skip tutorial
          </button>
        )}
      </div>
    </div>
  );
}
