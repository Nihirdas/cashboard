// Provider selection — the single seam between "demo" and "real" data.
//
// DEMO_MODE defaults to true, so a fresh clone runs on seed data with no setup
// and nothing to configure. Set DEMO_MODE=false (plus the relevant API keys)
// once you've implemented the real providers.

import { demoBank } from "./bank/demo";
import { gocardlessBank } from "./bank/gocardless";
import { demoTrading } from "./trading/demo";
import { alpacaTrading } from "./trading/alpaca";
import { demoAssetProvider } from "./assets/demo";
import type { AssetProvider, BankProvider, TradingProvider } from "./types";

export const isDemoMode = process.env.DEMO_MODE !== "false";

export function bankProvider(): BankProvider {
  return isDemoMode ? demoBank : gocardlessBank();
}

export function tradingProvider(): TradingProvider {
  return isDemoMode ? demoTrading : alpacaTrading();
}

// Non-bank assets (property, pensions). Until a real source exists these are
// user-maintained — the demo set, and later the spreadsheet import / manual
// entry — so this returns the demo provider in both modes for now.
export function assetsProvider(): AssetProvider {
  return demoAssetProvider;
}
