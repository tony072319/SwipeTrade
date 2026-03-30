import type { Trade } from "@/types/trade";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  balance: number;
  totalTrades: number;
  winningTrades: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  bestStreak: number;
  trades: Trade[];
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Trade count milestones
  {
    id: "first-trade",
    title: "First Steps",
    description: "Complete your first trade",
    icon: "🎯",
    tier: "bronze",
    check: (ctx) => ctx.totalTrades >= 1,
  },
  {
    id: "10-trades",
    title: "Getting Started",
    description: "Complete 10 trades",
    icon: "📊",
    tier: "bronze",
    check: (ctx) => ctx.totalTrades >= 10,
  },
  {
    id: "25-trades",
    title: "Regular Trader",
    description: "Complete 25 trades",
    icon: "📈",
    tier: "silver",
    check: (ctx) => ctx.totalTrades >= 25,
  },
  {
    id: "50-trades",
    title: "Seasoned Pro",
    description: "Complete 50 trades",
    icon: "💼",
    tier: "silver",
    check: (ctx) => ctx.totalTrades >= 50,
  },
  {
    id: "100-trades",
    title: "Market Veteran",
    description: "Complete 100 trades",
    icon: "🏆",
    tier: "gold",
    check: (ctx) => ctx.totalTrades >= 100,
  },

  // Win streak
  {
    id: "streak-3",
    title: "Hot Hand",
    description: "Achieve a 3-win streak",
    icon: "🔥",
    tier: "bronze",
    check: (ctx) => ctx.bestStreak >= 3,
  },
  {
    id: "streak-5",
    title: "On Fire",
    description: "Achieve a 5-win streak",
    icon: "🔥",
    tier: "silver",
    check: (ctx) => ctx.bestStreak >= 5,
  },
  {
    id: "streak-10",
    title: "Unstoppable",
    description: "Achieve a 10-win streak",
    icon: "⚡",
    tier: "gold",
    check: (ctx) => ctx.bestStreak >= 10,
  },
  {
    id: "streak-20",
    title: "Legendary Run",
    description: "Achieve a 20-win streak",
    icon: "💎",
    tier: "diamond",
    check: (ctx) => ctx.bestStreak >= 20,
  },

  // Profit milestones
  {
    id: "first-profit",
    title: "In the Green",
    description: "Have positive all-time P&L",
    icon: "💚",
    tier: "bronze",
    check: (ctx) => ctx.totalPnl > 0 && ctx.totalTrades >= 3,
  },
  {
    id: "profit-1k",
    title: "Thousand Club",
    description: "Earn $1,000 in total profit",
    icon: "💰",
    tier: "silver",
    check: (ctx) => ctx.totalPnl >= 1000,
  },
  {
    id: "profit-5k",
    title: "Big Money",
    description: "Earn $5,000 in total profit",
    icon: "🤑",
    tier: "gold",
    check: (ctx) => ctx.totalPnl >= 5000,
  },
  {
    id: "profit-10k",
    title: "Whale",
    description: "Earn $10,000 in total profit",
    icon: "🐋",
    tier: "diamond",
    check: (ctx) => ctx.totalPnl >= 10000,
  },

  // Balance milestones
  {
    id: "balance-15k",
    title: "Growth Mindset",
    description: "Grow portfolio to $15,000",
    icon: "🌱",
    tier: "bronze",
    check: (ctx) => ctx.balance >= 15000,
  },
  {
    id: "balance-25k",
    title: "Quarter Way",
    description: "Grow portfolio to $25,000",
    icon: "📈",
    tier: "silver",
    check: (ctx) => ctx.balance >= 25000,
  },
  {
    id: "balance-50k",
    title: "Half Way There",
    description: "Grow portfolio to $50,000",
    icon: "🚀",
    tier: "gold",
    check: (ctx) => ctx.balance >= 50000,
  },
  {
    id: "balance-100k",
    title: "Six Figures",
    description: "Grow portfolio to $100,000",
    icon: "👑",
    tier: "diamond",
    check: (ctx) => ctx.balance >= 100000,
  },

  // Win rate
  {
    id: "winrate-60",
    title: "Edge Finder",
    description: "Maintain 60%+ win rate (min 10 trades)",
    icon: "🎲",
    tier: "silver",
    check: (ctx) => ctx.totalTrades >= 10 && ctx.winningTrades / ctx.totalTrades >= 0.6,
  },
  {
    id: "winrate-70",
    title: "Sharp Shooter",
    description: "Maintain 70%+ win rate (min 20 trades)",
    icon: "🎯",
    tier: "gold",
    check: (ctx) => ctx.totalTrades >= 20 && ctx.winningTrades / ctx.totalTrades >= 0.7,
  },

  // Special achievements
  {
    id: "big-win",
    title: "Jackpot",
    description: "Win $500+ on a single trade",
    icon: "🎰",
    tier: "silver",
    check: (ctx) => ctx.bestTrade >= 500,
  },
  {
    id: "huge-win",
    title: "Moon Shot",
    description: "Win $2,000+ on a single trade",
    icon: "🌙",
    tier: "gold",
    check: (ctx) => ctx.bestTrade >= 2000,
  },
  {
    id: "diversified",
    title: "Diversified",
    description: "Trade 5 different assets",
    icon: "🌐",
    tier: "silver",
    check: (ctx) => {
      const unique = new Set(ctx.trades.map((t) => t.asset));
      return unique.size >= 5;
    },
  },
  {
    id: "both-ways",
    title: "Both Ways",
    description: "Win both a long and a short trade",
    icon: "↔️",
    tier: "bronze",
    check: (ctx) => {
      const hasLongWin = ctx.trades.some((t) => t.direction === "long" && t.pnl > 0);
      const hasShortWin = ctx.trades.some((t) => t.direction === "short" && t.pnl > 0);
      return hasLongWin && hasShortWin;
    },
  },
  {
    id: "comeback",
    title: "Comeback Kid",
    description: "Return to profit after being down $1,000+",
    icon: "💪",
    tier: "gold",
    check: (ctx) => {
      let balance = 10000;
      let wasDown1k = false;
      // Trades are newest-first, reverse to go chronologically
      const chronological = [...ctx.trades].reverse();
      for (const t of chronological) {
        balance += t.pnl;
        if (balance <= 9000) wasDown1k = true;
        if (wasDown1k && balance >= 10000) return true;
      }
      return false;
    },
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Trade between midnight and 5 AM",
    icon: "🦉",
    tier: "bronze",
    check: (ctx) => {
      return ctx.trades.some((t) => {
        const hour = new Date(t.createdAt).getHours();
        return hour >= 0 && hour < 5;
      });
    },
  },
];

const TIER_ORDER: Record<Achievement["tier"], number> = {
  diamond: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

export function checkAchievements(
  ctx: AchievementContext,
  unlocked: UnlockedAchievement[],
): UnlockedAchievement[] {
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.check(ctx)) {
      newlyUnlocked.push({
        id: achievement.id,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return newlyUnlocked;
}

export function sortAchievements(achievements: Achievement[]): Achievement[] {
  return [...achievements].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

export const TIER_COLORS: Record<Achievement["tier"], string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-300",
  gold: "from-yellow-500 to-amber-300",
  diamond: "from-cyan-400 to-blue-400",
};

export const TIER_BORDER: Record<Achievement["tier"], string> = {
  bronze: "border-amber-600/40",
  silver: "border-slate-400/40",
  gold: "border-yellow-500/40",
  diamond: "border-cyan-400/40",
};
