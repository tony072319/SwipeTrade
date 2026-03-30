export type TimeFrame = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";

export type AssetType = "crypto" | "stock";

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  coingeckoId?: string; // for crypto assets
}

export interface Candle {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ChartData {
  asset: Asset;
  timeframe: TimeFrame;
  visibleCandles: Candle[];
  hiddenCandles: Candle[];
}

export interface IndicatorData {
  volume?: (number | null)[];
  ema9?: (number | null)[];
  ema21?: (number | null)[];
  vwap?: (number | null)[];
  rsi?: (number | null)[];
  macd?: {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  };
  bollinger?: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
}
