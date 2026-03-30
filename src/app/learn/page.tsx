"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  category: "basics" | "patterns" | "indicators" | "psychology";
  content: string[];
  tip: string;
}

const LESSONS: Lesson[] = [
  {
    id: "candlesticks",
    title: "Reading Candlesticks",
    category: "basics",
    content: [
      "Each candlestick shows 4 prices: Open, High, Low, and Close (OHLC).",
      "A green candle means the Close was higher than the Open — the price went up during that period.",
      "A red candle means the Close was lower than the Open — the price went down.",
      "The thin lines (wicks) show the highest and lowest prices reached during the period.",
      "Long wicks often indicate rejection — the market tried to push higher/lower but was pushed back.",
    ],
    tip: "Look for candles with long lower wicks near support levels — they often signal buying pressure.",
  },
  {
    id: "trends",
    title: "Identifying Trends",
    category: "basics",
    content: [
      "An uptrend is defined by higher highs and higher lows — each swing goes higher than the last.",
      "A downtrend has lower highs and lower lows — each swing goes lower.",
      "Sideways/range-bound markets move between support and resistance without making new highs or lows.",
      "The trend is your friend — it's generally easier to trade with the trend than against it.",
      "Trend changes often start with a break of the pattern: the first lower low in an uptrend could signal reversal.",
    ],
    tip: "Use the 'higher highs, higher lows' framework. If you see this pattern, lean Long.",
  },
  {
    id: "support-resistance",
    title: "Support & Resistance",
    category: "basics",
    content: [
      "Support is a price level where buying pressure tends to prevent further decline.",
      "Resistance is a price level where selling pressure tends to prevent further advance.",
      "These levels are formed by previous price reactions — old support can become new resistance and vice versa.",
      "The more times a level has been tested, the more significant it becomes.",
      "Breakouts above resistance or below support often lead to strong moves in that direction.",
    ],
    tip: "Draw horizontal lines at price levels where the candles have bounced multiple times.",
  },
  {
    id: "doji",
    title: "Doji & Indecision Patterns",
    category: "patterns",
    content: [
      "A Doji has nearly equal Open and Close — it looks like a cross or plus sign.",
      "Doji candles signal indecision between buyers and sellers.",
      "A Doji after a strong trend can signal an upcoming reversal — the momentum is fading.",
      "Hammer (bullish): small body at top, long lower wick. Shows sellers tried but buyers took control.",
      "Shooting Star (bearish): small body at bottom, long upper wick. Shows buyers tried but sellers took control.",
    ],
    tip: "A Doji alone isn't a signal — wait for the next candle to confirm the direction.",
  },
  {
    id: "engulfing",
    title: "Engulfing Patterns",
    category: "patterns",
    content: [
      "A Bullish Engulfing: a small red candle followed by a larger green candle that completely covers it.",
      "A Bearish Engulfing: a small green candle followed by a larger red candle that completely covers it.",
      "Engulfing patterns are strongest at the end of trends, near support/resistance levels.",
      "The larger the engulfing candle relative to the previous candle, the stronger the signal.",
      "Volume confirmation: higher volume on the engulfing candle adds reliability.",
    ],
    tip: "Look for engulfing patterns at key support/resistance levels for high-probability trades.",
  },
  {
    id: "ema",
    title: "Moving Averages (EMA)",
    category: "indicators",
    content: [
      "EMA (Exponential Moving Average) smooths price data to identify the trend direction.",
      "EMA 9 (short-term) reacts quickly to price changes. Good for spotting momentum shifts.",
      "EMA 21 (medium-term) is slower but more reliable for trend identification.",
      "When price is above the EMA, the trend is generally bullish. Below = bearish.",
      "EMA crossovers: when the fast EMA (9) crosses above the slow EMA (21), it's a bullish signal (Golden Cross). The reverse is a Death Cross.",
    ],
    tip: "Enable both EMA 9 and EMA 21 in SwipeTrade. When they cross, pay attention!",
  },
  {
    id: "rsi",
    title: "RSI (Relative Strength Index)",
    category: "indicators",
    content: [
      "RSI measures momentum on a scale of 0-100.",
      "RSI above 70 = overbought. The asset may have risen too fast and could pull back.",
      "RSI below 30 = oversold. The asset may have fallen too fast and could bounce.",
      "RSI divergence: when price makes a new high but RSI doesn't — this signals weakening momentum.",
      "In strong trends, RSI can stay overbought/oversold for extended periods. Don't blindly counter-trade.",
    ],
    tip: "RSI works best in ranging markets. In strong trends, use it to find pullback entries instead.",
  },
  {
    id: "macd",
    title: "MACD",
    category: "indicators",
    content: [
      "MACD shows the relationship between two moving averages.",
      "MACD Line = 12-period EMA minus 26-period EMA.",
      "Signal Line = 9-period EMA of the MACD Line.",
      "When MACD crosses above the Signal Line, it's a bullish signal. Below = bearish.",
      "The histogram shows the difference between MACD and Signal. Growing bars = increasing momentum.",
    ],
    tip: "Watch for MACD histogram bars getting smaller — it means the current move is losing steam.",
  },
  {
    id: "risk",
    title: "Risk Management",
    category: "psychology",
    content: [
      "Never risk more than you can afford to lose on a single trade.",
      "In SwipeTrade, each trade risks 10% of your portfolio. In real trading, 1-2% is standard.",
      "Higher leverage amplifies both gains AND losses. Start with 1x until you're consistent.",
      "Winning 6 out of 10 trades with a 2:1 reward-to-risk ratio makes you profitable.",
      "Focus on the process, not the outcome. A good trade can lose, and a bad trade can win.",
    ],
    tip: "Reduce your leverage to 1x when you're on a losing streak. Protect your capital.",
  },
  {
    id: "psychology",
    title: "Trading Psychology",
    category: "psychology",
    content: [
      "FOMO (Fear of Missing Out) causes traders to enter too late, chasing moves.",
      "Revenge trading after losses leads to emotional, oversized positions.",
      "Confirmation bias makes you see what you want to see in the chart, not what's actually there.",
      "The best traders are patient — they wait for high-probability setups instead of trading everything.",
      "Keep a trading journal. Reviewing your decisions helps identify patterns in your behavior.",
    ],
    tip: "After 2 losses in a row, take a break. Come back with fresh eyes.",
  },
];

const CATEGORIES = [
  { key: "all" as const, label: "All" },
  { key: "basics" as const, label: "Basics" },
  { key: "patterns" as const, label: "Patterns" },
  { key: "indicators" as const, label: "Indicators" },
  { key: "psychology" as const, label: "Psychology" },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "A green candlestick means:",
    options: ["Price went down", "Price went up", "Market is closed", "High volume"],
    correct: 1,
    explanation: "A green (bullish) candle means the close price was higher than the open — the price went up during that period.",
  },
  {
    question: "RSI above 70 typically indicates:",
    options: ["Oversold conditions", "Overbought conditions", "Low volatility", "Strong support"],
    correct: 1,
    explanation: "RSI above 70 suggests the asset may be overbought and could be due for a pullback, though in strong trends it can stay elevated.",
  },
  {
    question: "What defines an uptrend?",
    options: ["Lower lows", "Higher highs and higher lows", "Flat price action", "Decreasing volume"],
    correct: 1,
    explanation: "An uptrend is defined by a series of higher highs and higher lows — each swing reaches a new high and doesn't fall as far.",
  },
  {
    question: "A Doji candle indicates:",
    options: ["Strong buying", "Strong selling", "Indecision", "Breakout"],
    correct: 2,
    explanation: "A Doji has nearly equal open and close prices, showing that neither buyers nor sellers dominated the period.",
  },
  {
    question: "When the MACD line crosses above the signal line, it's a:",
    options: ["Bearish signal", "Neutral signal", "Bullish signal", "Volume signal"],
    correct: 2,
    explanation: "A MACD crossover above the signal line is considered bullish, suggesting upward momentum is building.",
  },
  {
    question: "What is a Bullish Engulfing pattern?",
    options: [
      "A large red candle after a green candle",
      "A large green candle that engulfs the previous red candle",
      "Two red candles of equal size",
      "A candle with no wick",
    ],
    correct: 1,
    explanation: "A Bullish Engulfing occurs when a green candle completely covers the previous red candle, signaling potential reversal.",
  },
  {
    question: "In risk management, the standard risk per trade is:",
    options: ["10-20% of portfolio", "1-2% of portfolio", "50% of portfolio", "All of it"],
    correct: 1,
    explanation: "Professional traders typically risk 1-2% of their portfolio per trade to survive losing streaks and protect capital.",
  },
  {
    question: "Old support levels can become:",
    options: ["Irrelevant", "New resistance", "Wider candles", "Higher volume"],
    correct: 1,
    explanation: "When price breaks below support, that level often becomes resistance. This role reversal is a key principle of technical analysis.",
  },
  {
    question: "What is 'revenge trading'?",
    options: [
      "Trading a rival's stock",
      "Making emotional trades after losses to recover quickly",
      "A profitable strategy",
      "Trading the same asset twice",
    ],
    correct: 1,
    explanation: "Revenge trading is making impulsive, oversized trades to recover losses — it usually leads to bigger losses.",
  },
  {
    question: "Bollinger Bands tightening (squeezing) suggests:",
    options: ["Trend is over", "Low volatility, potential breakout", "High volatility", "Support level"],
    correct: 1,
    explanation: "When Bollinger Bands squeeze, volatility is low. This often precedes a significant move in either direction.",
  },
];

type Category = "all" | Lesson["category"];

function TradingQuiz() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      if (idx === question.correct) {
        setScore((s) => s + 1);
      }
      setShowResult(true);
    },
    [selected, question.correct],
  );

  const handleNext = useCallback(() => {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  }, [currentQ]);

  const handleRestart = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setFinished(false);
  }, []);

  if (!started) {
    return (
      <div className="mx-4 mt-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-purple-500/5 p-5 text-center">
        <h2 className="text-lg font-black">Trading Quiz</h2>
        <p className="mt-1 text-xs text-text-muted">
          Test your trading knowledge with {QUIZ_QUESTIONS.length} questions
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-3 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const grade =
      percentage >= 90
        ? { label: "Expert", color: "text-profit" }
        : percentage >= 70
          ? { label: "Advanced", color: "text-accent" }
          : percentage >= 50
            ? { label: "Intermediate", color: "text-yellow-500" }
            : { label: "Beginner", color: "text-loss" };

    return (
      <div className="mx-4 mt-6 rounded-2xl border border-border bg-surface-secondary p-5 text-center animate-scale-in">
        <h2 className="text-lg font-black">Quiz Complete!</h2>
        <div className="mt-3">
          <p className="text-4xl font-black tabular-nums">
            {score}/{QUIZ_QUESTIONS.length}
          </p>
          <p className={cn("text-sm font-bold mt-1", grade.color)}>
            {grade.label} ({percentage}%)
          </p>
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          <button
            onClick={handleRestart}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent/90"
          >
            Try Again
          </button>
          <Link
            href="/play"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-secondary transition-all hover:bg-surface-tertiary"
          >
            Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6 rounded-2xl border border-border bg-surface-secondary p-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-text-muted">
          Question {currentQ + 1}/{QUIZ_QUESTIONS.length}
        </span>
        <span className="text-[10px] font-bold text-accent">
          Score: {score}
        </span>
      </div>
      <div className="h-1 rounded-full bg-surface-tertiary mb-4">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-sm font-bold mb-3">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correct;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-xs font-medium transition-all",
                selected === null && "border-border hover:bg-surface-tertiary hover:border-text-muted/30",
                showResult && isCorrect && "border-profit bg-profit/10 text-profit",
                showResult && isSelected && !isCorrect && "border-loss bg-loss/10 text-loss",
                showResult && !isSelected && !isCorrect && "border-border opacity-40",
              )}
            >
              <span className="mr-2 inline-block w-4 text-center font-bold text-text-muted">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="mt-3 rounded-lg bg-surface-tertiary p-3 animate-fade-in">
          <p className="text-xs text-text-secondary leading-relaxed">
            {question.explanation}
          </p>
          <button
            onClick={handleNext}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-all hover:bg-accent/90"
          >
            {currentQ < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

const GLOSSARY: { term: string; definition: string }[] = [
  { term: "Long", definition: "A trade betting the price will go up. Buy low, sell high." },
  { term: "Short", definition: "A trade betting the price will go down. Sell high, buy back low." },
  { term: "Leverage", definition: "Multiplier that amplifies both gains and losses. 2x leverage means 2x the profit or 2x the loss." },
  { term: "P&L", definition: "Profit and Loss — the net dollar amount gained or lost on a trade." },
  { term: "Win Rate", definition: "Percentage of trades that are profitable. 60% means 6 out of 10 trades are wins." },
  { term: "Streak", definition: "Number of consecutive winning (or losing) trades in a row." },
  { term: "Timeframe", definition: "The time period each candlestick represents (1h = 1 hour per candle, 1D = 1 day)." },
  { term: "OHLC", definition: "Open, High, Low, Close — the four prices that make up each candlestick." },
  { term: "Support", definition: "A price level where buyers tend to step in, preventing further decline." },
  { term: "Resistance", definition: "A price level where sellers tend to step in, preventing further advance." },
  { term: "Breakout", definition: "When price moves beyond a support or resistance level with momentum." },
  { term: "Reversal", definition: "A change in the direction of a price trend (uptrend becomes downtrend or vice versa)." },
  { term: "EMA", definition: "Exponential Moving Average — a weighted average of recent prices that reacts faster to changes." },
  { term: "RSI", definition: "Relative Strength Index — measures momentum from 0-100. Above 70 = overbought, below 30 = oversold." },
  { term: "MACD", definition: "Moving Average Convergence Divergence — shows relationship between two EMAs to identify trend changes." },
  { term: "Bollinger Bands", definition: "Three lines showing price volatility. Tight bands = low volatility, wide bands = high volatility." },
  { term: "Drawdown", definition: "The decline from a peak to a trough in portfolio value. Measures risk." },
  { term: "Profit Factor", definition: "Total winning trades divided by total losing trades. Above 1.0 = profitable system." },
];

function TradingGlossary() {
  const [showGlossary, setShowGlossary] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? GLOSSARY.filter(
        (g) =>
          g.term.toLowerCase().includes(search.toLowerCase()) ||
          g.definition.toLowerCase().includes(search.toLowerCase()),
      )
    : GLOSSARY;

  return (
    <div className="mx-4 mt-6">
      <button
        onClick={() => setShowGlossary(!showGlossary)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3"
      >
        <div>
          <h2 className="text-sm font-bold">Trading Glossary</h2>
          <p className="text-[10px] text-text-muted">{GLOSSARY.length} terms</p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("text-text-muted transition-transform", showGlossary && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showGlossary && (
        <div className="mt-2 animate-fade-in">
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-accent"
          />
          <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto">
            {filtered.map((g) => (
              <div key={g.term} className="rounded-lg bg-surface-secondary px-3 py-2">
                <p className="text-xs font-bold text-accent">{g.term}</p>
                <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">{g.definition}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">No matching terms</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const [category, setCategory] = useState<Category>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = category === "all"
    ? LESSONS
    : LESSONS.filter((l) => l.category === category);

  return (
    <main className="min-h-dvh pb-20">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Learn to Trade</h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Master chart reading and technical analysis
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-4 pt-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              category === c.key
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lesson list */}
      <div className="px-4 mt-4 space-y-2">
        {filtered.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          return (
            <div
              key={lesson.id}
              className="rounded-xl border border-border bg-surface-secondary overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-bold">{lesson.title}</p>
                  <p className="text-[10px] text-text-muted capitalize">{lesson.category}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "text-text-muted transition-transform",
                    isExpanded && "rotate-180",
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                  <ul className="space-y-2">
                    {lesson.content.map((point, i) => (
                      <li key={i} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
                        <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Pro Tip</p>
                    <p className="text-xs text-text-secondary mt-0.5">{lesson.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trading Quiz */}
      <TradingQuiz />

      {/* Glossary */}
      <TradingGlossary />

      {/* CTA */}
      <div className="px-4 mt-6 text-center">
        <Link
          href="/play"
          className="inline-block rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
        >
          Practice Now
        </Link>
        <p className="mt-2 text-[10px] text-text-muted">Apply what you learned in free play</p>
      </div>
    </main>
  );
}
