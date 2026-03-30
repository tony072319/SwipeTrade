import type { Asset, TimeFrame } from "@/types/chart";

export const CRYPTO_ASSETS: Asset[] = [
  // Top 20 by market cap
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
  { symbol: "LINK", name: "Chainlink", type: "crypto", coingeckoId: "chainlink" },
  { symbol: "UNI", name: "Uniswap", type: "crypto", coingeckoId: "uniswap" },
  { symbol: "ATOM", name: "Cosmos", type: "crypto", coingeckoId: "cosmos" },
  { symbol: "LTC", name: "Litecoin", type: "crypto", coingeckoId: "litecoin" },
  { symbol: "NEAR", name: "NEAR", type: "crypto", coingeckoId: "near" },
  // Additional popular coins
  { symbol: "TRX", name: "TRON", type: "crypto", coingeckoId: "tron" },
  { symbol: "SHIB", name: "Shiba Inu", type: "crypto", coingeckoId: "shiba-inu" },
  { symbol: "APT", name: "Aptos", type: "crypto", coingeckoId: "aptos" },
  { symbol: "FIL", name: "Filecoin", type: "crypto", coingeckoId: "filecoin" },
  { symbol: "ARB", name: "Arbitrum", type: "crypto", coingeckoId: "arbitrum" },
  { symbol: "OP", name: "Optimism", type: "crypto", coingeckoId: "optimism" },
  { symbol: "SUI", name: "Sui", type: "crypto", coingeckoId: "sui" },
  { symbol: "INJ", name: "Injective", type: "crypto", coingeckoId: "injective-protocol" },
  { symbol: "AAVE", name: "Aave", type: "crypto", coingeckoId: "aave" },
  { symbol: "MKR", name: "Maker", type: "crypto", coingeckoId: "maker" },
];

export const STOCK_ASSETS: Asset[] = [
  // Mega-cap Tech
  { symbol: "AAPL", name: "Apple", type: "stock" },
  { symbol: "MSFT", name: "Microsoft", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet", type: "stock" },
  { symbol: "AMZN", name: "Amazon", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA", type: "stock" },
  { symbol: "META", name: "Meta", type: "stock" },
  { symbol: "TSLA", name: "Tesla", type: "stock" },
  // Tech & Semiconductors
  { symbol: "AMD", name: "AMD", type: "stock" },
  { symbol: "NFLX", name: "Netflix", type: "stock" },
  { symbol: "CRM", name: "Salesforce", type: "stock" },
  { symbol: "INTC", name: "Intel", type: "stock" },
  { symbol: "AVGO", name: "Broadcom", type: "stock" },
  { symbol: "ORCL", name: "Oracle", type: "stock" },
  { symbol: "ADBE", name: "Adobe", type: "stock" },
  { symbol: "QCOM", name: "Qualcomm", type: "stock" },
  { symbol: "MU", name: "Micron", type: "stock" },
  { symbol: "UBER", name: "Uber", type: "stock" },
  { symbol: "SHOP", name: "Shopify", type: "stock" },
  { symbol: "SQ", name: "Block", type: "stock" },
  { symbol: "PLTR", name: "Palantir", type: "stock" },
  { symbol: "SNAP", name: "Snap", type: "stock" },
  { symbol: "ROKU", name: "Roku", type: "stock" },
  // Finance
  { symbol: "JPM", name: "JPMorgan", type: "stock" },
  { symbol: "V", name: "Visa", type: "stock" },
  { symbol: "MA", name: "Mastercard", type: "stock" },
  { symbol: "BAC", name: "Bank of America", type: "stock" },
  { symbol: "GS", name: "Goldman Sachs", type: "stock" },
  { symbol: "PYPL", name: "PayPal", type: "stock" },
  { symbol: "COIN", name: "Coinbase", type: "stock" },
  // Healthcare
  { symbol: "JNJ", name: "J&J", type: "stock" },
  { symbol: "UNH", name: "UnitedHealth", type: "stock" },
  { symbol: "PFE", name: "Pfizer", type: "stock" },
  { symbol: "ABBV", name: "AbbVie", type: "stock" },
  { symbol: "LLY", name: "Eli Lilly", type: "stock" },
  { symbol: "MRNA", name: "Moderna", type: "stock" },
  // Consumer / Retail
  { symbol: "WMT", name: "Walmart", type: "stock" },
  { symbol: "COST", name: "Costco", type: "stock" },
  { symbol: "NKE", name: "Nike", type: "stock" },
  { symbol: "SBUX", name: "Starbucks", type: "stock" },
  { symbol: "MCD", name: "McDonald's", type: "stock" },
  { symbol: "DIS", name: "Disney", type: "stock" },
  { symbol: "KO", name: "Coca-Cola", type: "stock" },
  { symbol: "PEP", name: "PepsiCo", type: "stock" },
  // Industrial / Energy / Other
  { symbol: "BA", name: "Boeing", type: "stock" },
  { symbol: "XOM", name: "Exxon Mobil", type: "stock" },
  { symbol: "CVX", name: "Chevron", type: "stock" },
  { symbol: "CAT", name: "Caterpillar", type: "stock" },
  { symbol: "GE", name: "GE Aerospace", type: "stock" },
  // ETFs
  { symbol: "SPY", name: "S&P 500 ETF", type: "stock" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", type: "stock" },
  { symbol: "IWM", name: "Russell 2000 ETF", type: "stock" },
  { symbol: "DIA", name: "Dow Jones ETF", type: "stock" },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "stock" },
  { symbol: "XLF", name: "Financial Select ETF", type: "stock" },
  { symbol: "XLE", name: "Energy Select ETF", type: "stock" },
  { symbol: "GLD", name: "Gold ETF", type: "stock" },
  { symbol: "TLT", name: "20yr Treasury ETF", type: "stock" },
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
