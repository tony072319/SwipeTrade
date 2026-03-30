"use client";

import { useEffect, useState } from "react";

export default function LandscapeWarning() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isMobile && landscape);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface/95 backdrop-blur-sm">
      <div className="text-center px-8">
        <div className="text-4xl mb-4 animate-bounce-in">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-accent">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-text-primary">Rotate Your Device</h2>
        <p className="mt-2 text-sm text-text-muted max-w-[240px] mx-auto">
          SwipeTrade works best in portrait mode. Please rotate your phone.
        </p>
      </div>
    </div>
  );
}
