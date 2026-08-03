// Real bank data via GoCardless Bank Account Data (formerly Nordigen).
//
// It's free for EU/UK banks through PSD2 open banking, and uses OAuth-style
// end-user consent, so Cashboard never sees the user's banking credentials.
// Docs: https://developer.gocardless.com/bank-account-data/
//
// This is intentionally a stub: `DEMO_MODE=true` (the default) never reaches it.
// Flip DEMO_MODE off only once these methods are implemented and the env vars
// in .env.example are set. The full flow is:
//
//   1. POST /api/v2/token/new/            -> access token (from SECRET_ID/KEY)
//   2. GET  /api/v2/institutions/?country -> pick the bank
//   3. POST /api/v2/requisitions/         -> get a consent link, user approves
//   4. GET  /api/v2/accounts/{id}/balances/     -> Account.balance
//   5. GET  /api/v2/accounts/{id}/transactions/ -> Transaction[]
//
// Net-worth history isn't exposed by the API — it's built up over time by
// snapshotting balances (a job for the v3 roadmap), so for now it can return [].

import type { BankProvider } from "@/lib/providers/types";

function notConfigured(): never {
  throw new Error(
    "GoCardless provider is not implemented yet. Cashboard is running with " +
      "DEMO_MODE off but no real bank integration. Set DEMO_MODE=true, or " +
      "implement src/lib/providers/bank/gocardless.ts (see .env.example).",
  );
}

export function gocardlessBank(): BankProvider {
  return {
    name: "gocardless",
    async getAccounts() {
      notConfigured();
    },
    async getTransactions() {
      notConfigured();
    },
    async getNetWorthHistory() {
      notConfigured();
    },
  };
}
