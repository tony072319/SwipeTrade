import type { Direction, TradeResult } from "@/types/trade";

interface CalculateTradeParams {
  direction: Direction;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  betAmount: number;
}

export function calculateTrade(params: CalculateTradeParams): TradeResult {
  const { direction, leverage, entryPrice, exitPrice, betAmount } = params;

  const priceChange = (exitPrice - entryPrice) / entryPrice;
  const directionMultiplier = direction === "long" ? 1 : -1;
  const pnlPercent = priceChange * directionMultiplier * leverage;

  // Cap loss at bet amount (no negative balance from single trade)
  const pnl = Math.max(betAmount * pnlPercent, -betAmount);

  return {
    direction,
    leverage,
    entryPrice,
    exitPrice,
    betAmount,
    pnl: Math.round(pnl * 100) / 100,
    pnlPercent,
    isWin: pnl > 0,
  };
}
