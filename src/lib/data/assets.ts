import type { Asset, TimeFrame } from "@/types/chart";

export const CRYPTO_ASSETS: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", type: "crypto", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", coingeckoId: "ethereum" },
  { symbol: "SOL", name: "Solana", type: "crypto", coingeckoId: "solana" },
  { symbol: "BNB", name: "BNB", type: "crypto", coingeckoId: "binancecoin" },
  { symbol: "XRP", name: "XRP", type: "crypto", coingeckoId: "ripple" },
  { symbol: "ADA", name: "Cardano", type: "crypto", coingeckoId: "cardano" },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto", coingeckoId: "dogecoin" },
  { symbol: "AVAX", name: "Avalanche", type: "crypto", coingeckoId: "avalanche-2" },
  { symbol: "DOT", name: "Polkadot", type: "crypto", coingeckoId: "polkadot" },
  { symbol: "MATIC", name: "Polygon", type: "crypto", coingeckoId: "matic-network" },
];

export const STOCK_ASSETS: Asset[] = [
  { symbol: "AAPL", name: "Apple", type: "stock" },
  { symbol: "TSLA", name: "Tesla", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet", type: "stock" },
  { symbol: "AMZN", name: "Amazon", type: "stock" },
  { symbol: "MSFT", name: "Microsoft", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA", type: "stock" },
  { symbol: "META", name: "Meta", type: "stock" },
  { symbol: "SPY", name: "S&P 500 ETF", type: "stock" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", type: "stock" },
  { symbol: "AMD", name: "AMD", type: "stock" },
];

export const ALL_ASSETS: Asset[] = [...CRYPTO_ASSETS, ...STOCK_ASSETS];

// CoinGecko free tier doesn't support granular intraday OHLC
// Crypto: 1h, 4h, 1D only. Stocks: all timeframes.
export const TIMEFRAMES_BY_TYPE: Record<string, TimeFrame[]> = {
  crypto: ["1h", "4h", "1D"],
  stock: ["1m", "5m", "15m", "1h", "4h", "1D"],
};

export const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  "1m": "1 Min",
  "5m": "5 Min",
  "15m": "15 Min",
  "1h": "1 Hour",
  "4h": "4 Hour",
  "1D": "1 Day",
};
