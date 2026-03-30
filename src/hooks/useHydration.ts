"use client";

import { useEffect, useState } from "react";

// Prevents SSR hydration mismatch with Zustand persist middleware
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
