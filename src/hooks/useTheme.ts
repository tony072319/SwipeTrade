"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useHydration } from "@/hooks/useHydration";

export function useTheme() {
  const hydrated = useHydration();
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f8fafc" : "#0f172a");
    }
  }, [hydrated, theme]);
}
