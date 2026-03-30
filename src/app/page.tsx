import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-6M6 20V10M18 20V4" />
      </svg>
    ),
    title: "Real Charts",
    desc: "Practice on real historical price data from crypto and stocks",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "No Risk",
    desc: "Trade with a simulated $10,000 portfolio — learn without losing",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Daily Challenge",
    desc: "10 charts per day, same for everyone — compete for the best P&L",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Technical Indicators",
    desc: "Add EMA, RSI, MACD, Bollinger Bands and more to your charts",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col pb-16">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 flex items-end gap-1">
          <div className="w-2.5 h-8 bg-profit rounded-sm animate-pulse" style={{ animationDelay: "0s" }} />
          <div className="w-2.5 h-14 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-2.5 h-6 bg-profit rounded-sm animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="w-2.5 h-10 bg-profit rounded-sm animate-pulse" style={{ animationDelay: "0.6s" }} />
          <div className="w-2.5 h-12 bg-loss rounded-sm animate-pulse" style={{ animationDelay: "0.8s" }} />
          <div className="w-2.5 h-5 bg-profit rounded-sm animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="w-2.5 h-16 bg-profit rounded-sm animate-pulse" style={{ animationDelay: "1.2s" }} />
        </div>

        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-accent via-purple-400 to-accent bg-clip-text text-transparent">
          SwipeTrade
        </h1>
        <p className="mt-3 max-w-sm text-lg text-text-secondary leading-relaxed">
          Read the chart. Make the call.
          <br />
          <span className="text-profit font-semibold">Swipe right → Long</span>
          {" · "}
          <span className="text-loss font-semibold">Swipe left → Short</span>
        </p>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/play"
            className="rounded-xl bg-accent py-4 text-center text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Start Trading
          </Link>
          <Link
            href="/daily"
            className="rounded-xl border border-border bg-surface-secondary py-3.5 text-center text-sm font-bold text-text-secondary transition-all hover:bg-surface-tertiary"
          >
            Daily Challenge
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-surface-secondary/50 p-4"
            >
              <div className="mb-2 text-accent">{f.icon}</div>
              <h3 className="text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-border px-6 py-8">
        <h2 className="text-center text-lg font-bold mb-6">How It Works</h2>
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-black text-accent">1</div>
            <div>
              <p className="text-sm font-semibold">Study the Chart</p>
              <p className="text-xs text-text-muted">Read 50 candlesticks of real market data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-black text-accent">2</div>
            <div>
              <p className="text-sm font-semibold">Make Your Call</p>
              <p className="text-xs text-text-muted">Swipe right for Long or left for Short</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-black text-accent">3</div>
            <div>
              <p className="text-sm font-semibold">Watch the Reveal</p>
              <p className="text-xs text-text-muted">20 hidden candles animate in — see if you were right</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-profit/10 text-sm font-black text-profit">$</div>
            <div>
              <p className="text-sm font-semibold">Grow Your Portfolio</p>
              <p className="text-xs text-text-muted">Build your $10k into a fortune (or learn from losses)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
