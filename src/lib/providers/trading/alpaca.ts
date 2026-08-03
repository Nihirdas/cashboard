// Real investment data via Alpaca (https://alpaca.markets/).
//
// Alpaca's paper-trading environment is free and gives you real-time market
// data against a simulated portfolio — an ideal match for tracking holdings
// without wiring up a live brokerage. Point ALPACA_BASE_URL at the paper host.
//
// This is intentionally a stub: `DEMO_MODE=true` (the default) never reaches it.
// The real implementation calls, with the APCA-API-KEY-ID / APCA-API-SECRET-KEY
// headers from .env.example:
//
//   GET {baseUrl}/v2/account    -> Portfolio.cash (the `cash` field)
//   GET {baseUrl}/v2/positions  -> Position[] (qty, avg_entry_price, current_price)

import type { TradingProvider } from "@/lib/providers/types";

function notConfigured(): never {
  throw new Error(
    "Alpaca provider is not implemented yet. Cashboard is running with " +
      "DEMO_MODE off but no real trading integration. Set DEMO_MODE=true, or " +
      "implement src/lib/providers/trading/alpaca.ts (see .env.example).",
  );
}

export function alpacaTrading(): TradingProvider {
  return {
    name: "alpaca",
    async getPortfolio() {
      notConfigured();
    },
  };
}
