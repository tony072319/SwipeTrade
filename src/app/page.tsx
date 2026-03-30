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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
    desc: "EMA, RSI, MACD, Bollinger Bands and more on your charts",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    title: "Achievements",
    desc: "Unlock 25+ badges as you hit trading milestones and streaks",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Fun & Addictive",
    desc: "Quick rounds, confetti on wins, streaks, and satisfying sounds",
  },
];

const STEPS = [
  {
    num: "1",
    color: "accent",
    title: "Study the Chart",
    desc: "Read 50 candlesticks of real market data",
  },
  {
    num: "2",
    color: "accent",
    title: "Make Your Call",
    desc: "Swipe right for Long or left for Short",
  },
  {
    num: "3",
    color: "accent",
    title: "Watch the Reveal",
    desc: "20 hidden candles animate in — see if you were right",
  },
  {
    num: "$",
    color: "profit",
    title: "Grow Your Portfolio",
    desc: "Build your $10k into a fortune (or learn from losses)",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        {/* Animated candlestick bars */}
        <div className="mb-8 flex items-end gap-1.5 relative">
          {[
            { h: "32px", color: "#00dc82", delay: "0s" },
            { h: "56px", color: "#ff4757", delay: "0.15s" },
            { h: "24px", color: "#00dc82", delay: "0.3s" },
            { h: "40px", color: "#00dc82", delay: "0.45s" },
            { h: "48px", color: "#ff4757", delay: "0.6s" },
            { h: "20px", color: "#00dc82", delay: "0.75s" },
            { h: "64px", color: "#00dc82", delay: "0.9s" },
            { h: "36px", color: "#ff4757", delay: "1.05s" },
            { h: "52px", color: "#00dc82", delay: "1.2s" },
          ].map((bar, i) => (
            <div
              key={i}
              className="w-3 rounded-sm animate-pulse"
              style={{
                height: bar.h,
                backgroundColor: bar.color,
                animationDelay: bar.delay,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          SwipeTrade
        </h1>
        <p className="mt-4 max-w-sm text-lg text-text-secondary leading-relaxed">
          Read the chart. Make the call.
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-profit font-semibold">Swipe right = Long</span>
          <span className="text-text-muted">|</span>
          <span className="text-loss font-semibold">Swipe left = Short</span>
        </div>

        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/play"
            className="rounded-2xl bg-accent py-4 text-center text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98]"
          >
            Start Trading
          </Link>
          <div className="flex gap-2 w-full">
            <Link
              href="/daily"
              className="flex-1 rounded-2xl border border-border bg-surface-secondary py-3.5 text-center text-sm font-bold text-text-secondary transition-all hover:bg-surface-tertiary"
            >
              Daily
            </Link>
            <Link
              href="/speed"
              className="flex-1 rounded-2xl border border-accent/30 bg-accent/10 py-3.5 text-center text-sm font-bold text-accent transition-all hover:bg-accent/20"
            >
              Speed Round
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 flex gap-6">
          <div className="text-center">
            <p className="text-lg font-black text-text-primary">100+</p>
            <p className="text-[10px] text-text-muted">Assets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-text-primary">6</p>
            <p className="text-[10px] text-text-muted">Timeframes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-text-primary">25+</p>
            <p className="text-[10px] text-text-muted">Achievements</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-8">
        <h2 className="text-center text-lg font-bold mb-4">Features</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-surface-secondary/50 p-4 transition-colors hover:bg-surface-secondary"
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
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-${step.color}/10 text-sm font-black text-${step.color}`}>
                {step.num}
              </div>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials / social proof */}
      <div className="border-t border-border px-6 py-8">
        <h2 className="text-center text-lg font-bold mb-4">What Traders Say</h2>
        <div className="space-y-3 max-w-sm mx-auto">
          {[
            {
              text: "Finally a way to practice chart reading without risking real money. Addicted!",
              author: "CryptoTrader23",
              stat: "32W streak",
            },
            {
              text: "The daily challenge is genius. I compete with my trading group every day.",
              author: "MarketMaven",
              stat: "$48k portfolio",
            },
            {
              text: "Bollinger Bands + RSI combo is my edge. Loving the indicators feature.",
              author: "TechAnalyst",
              stat: "72% win rate",
            },
          ].map((t) => (
            <div
              key={t.author}
              className="rounded-xl border border-border bg-surface-secondary/50 p-4"
            >
              <p className="text-xs text-text-secondary italic leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted">@{t.author}</span>
                <span className="text-[10px] font-bold text-accent">{t.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 pb-20 text-center">
        <Link
          href="/play"
          className="inline-block rounded-2xl bg-accent px-12 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Start Trading Now
        </Link>
        <p className="mt-3 text-xs text-text-muted">No signup required. Play instantly.</p>
      </div>
    </main>
  );
}
