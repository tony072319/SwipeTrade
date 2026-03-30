"use client";

import { useEffect } from "react";
import { useSettingsStore, ACCENT_COLORS } from "@/stores/settings-store";
import { useHydration } from "@/hooks/useHydration";

export function useAccentColor() {
  const hydrated = useHydration();
  const accentColor = useSettingsStore((s) => s.accentColor);

  useEffect(() => {
    if (!hydrated) return;
    const hex = ACCENT_COLORS[accentColor];
    document.documentElement.style.setProperty("--color-accent", hex);
    document.documentElement.style.setProperty("--color-accent-bg", hex + "20");
  }, [hydrated, accentColor]);
}
