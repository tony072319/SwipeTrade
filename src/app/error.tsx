"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-16 text-center">
      <div className="mb-6 flex items-end gap-1 opacity-30">
        <div className="w-3 h-12 bg-loss rounded-sm animate-pulse" />
        <div className="w-3 h-6 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.1s" }} />
        <div className="w-3 h-16 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.2s" }} />
        <div className="w-3 h-4 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.3s" }} />
        <div className="w-3 h-10 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.4s" }} />
      </div>

      <h1 className="text-2xl font-black text-loss">Something went wrong</h1>
      <p className="mt-2 text-sm text-text-muted max-w-xs">
        The market hit a circuit breaker. Let&apos;s try again.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Try Again
        </button>
        <button
          onClick={() => {
            if (confirm("This will clear all local data (portfolio, settings, achievements). Continue?")) {
              localStorage.clear();
              window.location.href = "/play";
            }
          }}
          className="rounded-xl border border-border px-8 py-3 text-sm font-medium text-text-muted transition-all hover:bg-surface-secondary"
        >
          Clear Data & Restart
        </button>
      </div>

      {error.digest && (
        <p className="mt-4 text-[9px] text-text-muted/30 font-mono">Error ID: {error.digest}</p>
      )}
    </main>
  );
}
