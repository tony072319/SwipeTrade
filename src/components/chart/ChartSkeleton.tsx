"use client";

export default function ChartSkeleton() {
  return (
    <div className="flex h-full w-full items-end gap-1.5 p-8 pb-12 opacity-20">
      {Array.from({ length: 30 }).map((_, i) => {
        const height = 20 + Math.random() * 60;
        const isGreen = Math.random() > 0.45;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm animate-pulse"
            style={{
              height: `${height}%`,
              backgroundColor: isGreen ? "#00dc82" : "#ff4757",
              animationDelay: `${i * 0.05}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        );
      })}
    </div>
  );
}
