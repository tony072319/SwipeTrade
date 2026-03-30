"use client";

import { useEffect, type ReactNode } from "react";
import { useAccentColor } from "@/hooks/useAccentColor";

export default function ClientProviders({ children }: { children: ReactNode }) {
  useAccentColor();

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed — not critical
      });
    }
  }, []);

  return <>{children}</>;
}
