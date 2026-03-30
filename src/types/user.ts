export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  balance: number;
  totalTrades: number;
  winningTrades: number;
  totalPnl: number;
  createdAt: string;
}

export interface UserStats {
  balance: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
}
