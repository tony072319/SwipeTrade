"use client";

import { useState, useEffect, useRef } from "react";

export default function SessionTimer() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (elapsed < 60) return null; // Don't show until 1 minute in

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="absolute bottom-1 left-1 z-10 rounded-md bg-surface-secondary/80 px-1.5 py-0.5 text-[8px] font-mono text-text-muted/50 backdrop-blur-sm">
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
