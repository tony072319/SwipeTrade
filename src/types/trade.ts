export type Direction = "long" | "short";

export interface Trade {
  id: string;
  asset: string;
  assetType: "crypto" | "stock";
  timeframe: string;
  direction: Direction;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  betAmount: number;
  pnl: number;
  isDailyChallenge: boolean;
  dailyChallengeDate?: string;
  createdAt: string;
}

export interface TradeResult {
  direction: Direction;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  betAmount: number;
  pnl: number;
  pnlPercent: number;
  isWin: boolean;
}
