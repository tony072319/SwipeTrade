"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { keys: ["→", "L"], desc: "Go Long" },
  { keys: ["←", "S"], desc: "Go Short" },
  { keys: ["Space", "Enter"], desc: "Next Trade (result screen)" },
  { keys: ["?"], desc: "Toggle keyboard help" },
];

export default function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface-secondary p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className={cn(
                      "rounded-md border border-border bg-surface-tertiary px-2 py-0.5 text-xs font-mono font-bold text-text-primary",
                    )}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
