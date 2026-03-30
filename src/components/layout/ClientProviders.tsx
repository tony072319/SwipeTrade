"use client";

import type { ReactNode } from "react";
import { useAccentColor } from "@/hooks/useAccentColor";

export default function ClientProviders({ children }: { children: ReactNode }) {
  useAccentColor();
  return <>{children}</>;
}
