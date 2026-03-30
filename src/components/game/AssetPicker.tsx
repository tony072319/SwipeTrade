"use client";

import { useState } from "react";
import type { Asset } from "@/types/chart";
import { CRYPTO_ASSETS, STOCK_ASSETS } from "@/lib/data/assets";
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState<"crypto" | "stocks">("crypto");

  if (!open) return null;

  const assets = tab === "crypto" ? CRYPTO_ASSETS : STOCK_ASSETS;

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

        {/* Random option */}
        <button
          onClick={() => { onSelect(null); onClose(); }}
          className={cn(
            "mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all",
            !selectedAsset
              ? "border-accent/30 bg-accent-bg text-accent"
              : "border-border bg-surface-tertiary text-text-secondary hover:bg-surface-tertiary/80",
          )}
        >
          🎲 Random Asset
        </button>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          <button
            onClick={() => setTab("crypto")}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all",
              tab === "crypto"
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            Crypto
          </button>
          <button
            onClick={() => setTab("stocks")}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all",
              tab === "stocks"
                ? "bg-accent text-white"
                : "bg-surface-tertiary text-text-muted hover:text-text-secondary",
            )}
          >
            Stocks
          </button>
        </div>

        {/* Asset grid */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-6 max-h-60 overflow-y-auto">
          {assets.map((asset) => {
            const isSelected = selectedAsset?.symbol === asset.symbol;
            return (
              <button
                key={asset.symbol}
                onClick={() => { onSelect(asset); onClose(); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                  isSelected
                    ? "border-accent/30 bg-accent-bg"
                    : "border-border bg-surface-tertiary hover:border-border-light",
                )}
              >
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-accent" : "text-text-primary",
                  )}>
                    {asset.symbol}
                  </span>
                  <span className="text-[10px] text-text-muted">{asset.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
