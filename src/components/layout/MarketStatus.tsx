"use client";

import { useState, useEffect } from "react";

function getMarketStatus(): { us: boolean; crypto: boolean; label: string } {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat

  // Crypto is 24/7
  const crypto = true;

  // US market: Mon-Fri, 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
  const isWeekday = day >= 1 && day <= 5;
  const utcMinutes = utcHour * 60 + utcMin;
  const us = isWeekday && utcMinutes >= 870 && utcMinutes < 1260; // 14:30=870, 21:00=1260

  const label = us ? "US Open" : isWeekday ? "US Closed" : "Weekend";

  return { us, crypto, label };
}

export default function MarketStatus() {
  const [status, setStatus] = useState<{ us: boolean; crypto: boolean; label: string } | null>(null);

  useEffect(() => {
    setStatus(getMarketStatus());
    const interval = setInterval(() => setStatus(getMarketStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="flex items-center gap-2 text-[9px]">
      <div className="flex items-center gap-1">
        <div className={`h-1.5 w-1.5 rounded-full ${status.us ? "bg-profit animate-pulse" : "bg-text-muted/30"}`} />
        <span className="text-text-muted">{status.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
        <span className="text-text-muted">Crypto 24/7</span>
      </div>
    </div>
  );
}
