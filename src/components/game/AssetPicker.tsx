"use client";

import { useState, useMemo } from "react";
import type { Asset } from "@/types/chart";
import { CRYPTO_ASSETS, STOCK_ASSETS, ALL_ASSETS } from "@/lib/data/assets";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

// ETF symbols for sub-filtering
const ETF_SYMBOLS = new Set(["SPY", "QQQ", "IWM", "DIA", "ARKK", "XLF", "XLE", "GLD", "TLT"]);
const ETF_ASSETS = STOCK_ASSETS.filter((a) => ETF_SYMBOLS.has(a.symbol));
const PURE_STOCK_ASSETS = STOCK_ASSETS.filter((a) => !ETF_SYMBOLS.has(a.symbol));

// Sector mapping for stock labels
const SECTOR_MAP: Record<string, string> = {
  AAPL: "Tech", MSFT: "Tech", GOOGL: "Tech", AMZN: "Tech", NVDA: "Tech", META: "Tech", TSLA: "Tech",
  AMD: "Semis", NFLX: "Tech", CRM: "Tech", INTC: "Semis", AVGO: "Semis", ORCL: "Tech", ADBE: "Tech",
  QCOM: "Semis", MU: "Semis", UBER: "Tech", SHOP: "Tech", SQ: "Fintech", PLTR: "Tech", SNAP: "Tech", ROKU: "Tech",
  JPM: "Finance", V: "Finance", MA: "Finance", BAC: "Finance", GS: "Finance", PYPL: "Fintech", COIN: "Fintech",
  JNJ: "Health", UNH: "Health", PFE: "Health", ABBV: "Health", LLY: "Health", MRNA: "Health",
  WMT: "Consumer", COST: "Consumer", NKE: "Consumer", SBUX: "Consumer", MCD: "Consumer", DIS: "Consumer", KO: "Consumer", PEP: "Consumer",
  BA: "Industrial", XOM: "Energy", CVX: "Energy", CAT: "Industrial", GE: "Industrial",
  T: "Telecom", VZ: "Telecom", TMUS: "Telecom", CMCSA: "Telecom",
  AMT: "REIT", O: "REIT",
  FCX: "Materials", NEM: "Materials", LIN: "Materials",
  UPS: "Transport", FDX: "Transport", DAL: "Transport", UAL: "Transport",
  RIVN: "Growth", LCID: "Growth", SOFI: "Growth", HOOD: "Growth", RBLX: "Growth", U: "Growth",
};

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset | null) => void;
  selectedAsset: Asset | null;
}

export default function AssetPicker({
  open,
  onClose,
  onSelect,
  selectedAsset,
}: AssetPickerProps) {
  const [tab, setTab] = useState<"all" | "crypto" | "stocks" | "etfs">("all");
  const [search, setSearch] = useState("");
  const { recentAssets, favoriteAssets, addRecentAsset, toggleFavorite } = useSettingsStore();

  const baseAssets = tab === "crypto" ? CRYPTO_ASSETS : tab === "stocks" ? PURE_STOCK_ASSETS : tab === "etfs" ? ETF_ASSETS : ALL_ASSETS;

  const assets = useMemo(() => {
    if (!search.trim()) return baseAssets;
    const q = search.toLowerCase();
    return baseAssets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q),
    );
  }, [baseAssets, search]);

  const recentAssetObjects = useMemo(
    () => recentAssets
      .map((s) => ALL_ASSETS.find((a) => a.symbol === s))
      .filter(Boolean) as Asset[],
    [recentAssets],
  );

  const favoriteAssetObjects = useMemo(
    () => favoriteAssets
      .map((s) => ALL_ASSETS.find((a) => a.symbol === s))
      .filter(Boolean) as Asset[],
    [favoriteAssets],
  );

  const handleSelect = (asset: Asset | null) => {
    if (asset) addRecentAsset(asset.symbol);
    onSelect(asset);
    onClose();
    setSearch("");
  };

  if (!open) return null;

  const showRecent = !search && tab === "all" && recentAssetObjects.length > 0;
  const showFavorites = !search && tab === "all" && favoriteAssetObjects.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-glass-border bg-surface-secondary animate-slide-up pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />

        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold">Choose Asset</h2>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Random option */}
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            "mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-all",
            !selectedAsset
              ? "border-accent/30 bg-accent-bg text-accent"
              : "border-border bg-surface-tertiary text-text-secondary hover:bg-surface-tertiary/80",
          )}
        >
          🎲 Random
        </button>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {[
            { key: "all" as const, label: `All (${ALL_ASSETS.length})` },
            { key: "crypto" as const, label: `Crypto (${CRYPTO_ASSETS.length})` },
            { key: "stocks" as const, label: `Stocks (${PURE_STOCK_ASSETS.length})` },
            { key: "etfs" as const, label: `ETFs (${ETF_ASSETS.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={cn(
                "flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                tab === t.key
                  ? "bg-accent text-white"
                  : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60dvh] overflow-y-auto px-4 pb-6">
          {/* Favorite assets */}
          {showFavorites && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase text-text-muted mb-1.5">Favorites</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {favoriteAssetObjects.map((asset) => (
                  <button
                    key={`fav-${asset.symbol}`}
                    onClick={() => handleSelect(asset)}
                    className={cn(
                      "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                      selectedAsset?.symbol === asset.symbol
                        ? "border-accent/30 bg-accent-bg text-accent"
                        : "border-yellow-500/20 bg-yellow-500/5 text-text-secondary hover:border-yellow-500/40",
                    )}
                  >
                    ★ {asset.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent assets */}
          {showRecent && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase text-text-muted mb-1.5">Recent</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {recentAssetObjects.map((asset) => (
                  <button
                    key={`recent-${asset.symbol}`}
                    onClick={() => handleSelect(asset)}
                    className="shrink-0 rounded-lg border border-border bg-surface-tertiary px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-accent/30 transition-all"
                  >
                    {asset.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Asset grid */}
          <div className="grid grid-cols-2 gap-2">
            {assets.length === 0 ? (
              <div className="col-span-2 py-6 text-center text-xs text-text-muted">
                No assets match &ldquo;{search}&rdquo;
              </div>
            ) : (
              assets.map((asset) => {
                const isSelected = selectedAsset?.symbol === asset.symbol;
                const isFav = favoriteAssets.includes(asset.symbol);
                return (
                  <div
                    key={asset.symbol}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all",
                      isSelected
                        ? "border-accent/30 bg-accent-bg"
                        : "border-border bg-surface-tertiary hover:border-border-light",
                    )}
                  >
                    <button
                      onClick={() => handleSelect(asset)}
                      className="flex flex-col text-left flex-1"
                    >
                      <span className={cn(
                        "text-sm font-bold",
                        isSelected ? "text-accent" : "text-text-primary",
                      )}>
                        {asset.symbol}
                      </span>
                      <span className="text-[9px] text-text-muted">
                        {asset.name}
                        {SECTOR_MAP[asset.symbol] && (
                          <span className="ml-1 text-[8px] text-accent/60">{SECTOR_MAP[asset.symbol]}</span>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                      className={cn(
                        "ml-1 text-xs transition-all",
                        isFav ? "text-yellow-400" : "text-text-muted/30 hover:text-text-muted",
                      )}
                    >
                      {isFav ? "★" : "☆"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
