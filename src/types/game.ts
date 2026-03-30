import type { ChartData } from "./chart";
import type { Direction, TradeResult } from "./trade";

export type GamePhase =
  | "loading"    // fetching chart data
  | "viewing"    // user is reading the chart
  | "swiped"     // user has swiped, about to reveal
  | "revealing"  // candles animating in
  | "result"     // P&L shown, waiting for next
  ;

export interface GameState {
  phase: GamePhase;
  chart: ChartData | null;
  direction: Direction | null;
  leverage: number;
  revealedCount: number; // how many hidden candles have been shown
  result: TradeResult | null;
}

export interface DailyChallenge {
  date: string;
  charts: ChartData[];
  currentIndex: number;
  totalPnl: number;
  tradesWon: number;
  completed: boolean;
}
