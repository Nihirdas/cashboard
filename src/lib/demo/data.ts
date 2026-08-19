// Demo dataset. This is what makes Cashboard runnable with zero setup and safe
// to open-source: no real accounts, no secrets, nothing to leak. Dates are
// generated relative to "today" so the feed always looks alive.

import type {
  Account,
  Asset,
  NetWorthPoint,
  Portfolio,
  Position,
  Transaction,
} from "@/lib/providers/types";

const CURRENCY = "EUR";

export const demoAccounts: Account[] = [
  {
    id: "acc_current",
    name: "Everyday Current",
    institution: "N26",
    type: "current",
    currency: CURRENCY,
    balance: 4820.55,
  },
  {
    id: "acc_savings",
    name: "Rainy Day Savings",
    institution: "Trade Republic",
    type: "savings",
    currency: CURRENCY,
    balance: 18250.0,
  },
  {
    id: "acc_credit",
    name: "Rewards Credit Card",
    institution: "Amex",
    type: "credit",
    currency: CURRENCY,
    balance: -1264.38,
  },
];

export const demoPositions: Position[] = [
  { symbol: "AAPL", name: "Apple Inc.", quantity: 18, avgPrice: 176.4, lastPrice: 231.2 },
  { symbol: "MSFT", name: "Microsoft Corp.", quantity: 9, avgPrice: 342.1, lastPrice: 471.85 },
  { symbol: "VWCE", name: "Vanguard FTSE All-World", quantity: 42, avgPrice: 104.9, lastPrice: 128.6 },
  { symbol: "NVDA", name: "NVIDIA Corp.", quantity: 14, avgPrice: 98.3, lastPrice: 129.4 },
  { symbol: "TSLA", name: "Tesla Inc.", quantity: 6, avgPrice: 265.0, lastPrice: 214.7 },
];

const BROKERAGE_CASH = 1340.22;

export const demoAssets: Asset[] = [
  {
    id: "asset_flat",
    name: "Apartment — Vienna",
    kind: "property",
    currency: CURRENCY,
    value: 335000,
    liability: 198000, // outstanding mortgage
    purchasePrice: 290000,
    purchaseDate: "2022-05-01",
    appreciationRate: 0.035,
  },
  {
    id: "asset_pension",
    name: "Retirement Fund",
    kind: "pension",
    currency: CURRENCY,
    value: 42500,
    appreciationRate: 0.05,
  },
];

// ---------------------------------------------------------------------------
// Date helpers (runtime-relative so the demo never goes stale).
// ---------------------------------------------------------------------------

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoFirstOfMonth(monthsAgo: number): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Transactions — a fixed template offset from today, so it's deterministic
// (no flicker / hydration drift) yet always current.
// ---------------------------------------------------------------------------

type Tpl = Omit<Transaction, "id" | "date"> & { daysAgo: number };

const transactionTemplates: Tpl[] = [
  // Income
  { daysAgo: 2, accountId: "acc_current", description: "Salary — Acme GmbH", category: "Income", amount: 3180.0 },
  { daysAgo: 33, accountId: "acc_current", description: "Salary — Acme GmbH", category: "Income", amount: 3180.0 },
  { daysAgo: 12, accountId: "acc_current", description: "Freelance invoice #0042", category: "Income", amount: 640.0 },
  // Housing
  { daysAgo: 4, accountId: "acc_current", description: "Rent — Ringstrasse 12", category: "Housing", amount: -1250.0 },
  { daysAgo: 34, accountId: "acc_current", description: "Rent — Ringstrasse 12", category: "Housing", amount: -1250.0 },
  // Utilities
  { daysAgo: 6, accountId: "acc_current", description: "Wien Energie", category: "Utilities", amount: -78.4 },
  { daysAgo: 9, accountId: "acc_current", description: "A1 Mobile", category: "Utilities", amount: -29.99 },
  { daysAgo: 8, accountId: "acc_current", description: "Magenta Internet", category: "Utilities", amount: -39.9 },
  // Groceries
  { daysAgo: 1, accountId: "acc_credit", description: "Billa", category: "Groceries", amount: -46.72 },
  { daysAgo: 3, accountId: "acc_credit", description: "Hofer", category: "Groceries", amount: -61.15 },
  { daysAgo: 7, accountId: "acc_credit", description: "Spar", category: "Groceries", amount: -33.28 },
  { daysAgo: 11, accountId: "acc_credit", description: "Billa", category: "Groceries", amount: -52.9 },
  { daysAgo: 16, accountId: "acc_credit", description: "Hofer", category: "Groceries", amount: -44.06 },
  { daysAgo: 24, accountId: "acc_credit", description: "Spar", category: "Groceries", amount: -38.5 },
  // Dining
  { daysAgo: 2, accountId: "acc_credit", description: "Figlmüller", category: "Dining", amount: -58.0 },
  { daysAgo: 5, accountId: "acc_credit", description: "Starbucks", category: "Dining", amount: -6.4 },
  { daysAgo: 10, accountId: "acc_credit", description: "Vapiano", category: "Dining", amount: -27.8 },
  { daysAgo: 19, accountId: "acc_credit", description: "Kebap Stand", category: "Dining", amount: -9.5 },
  // Transport
  { daysAgo: 3, accountId: "acc_credit", description: "Wiener Linien — monthly", category: "Transport", amount: -51.0 },
  { daysAgo: 14, accountId: "acc_credit", description: "Uber", category: "Transport", amount: -18.3 },
  { daysAgo: 22, accountId: "acc_credit", description: "ÖBB — Vienna→Graz", category: "Transport", amount: -39.9 },
  // Subscriptions
  { daysAgo: 5, accountId: "acc_credit", description: "Netflix", category: "Subscriptions", amount: -17.99 },
  { daysAgo: 6, accountId: "acc_credit", description: "Spotify", category: "Subscriptions", amount: -10.99 },
  { daysAgo: 15, accountId: "acc_credit", description: "iCloud+", category: "Subscriptions", amount: -2.99 },
  { daysAgo: 18, accountId: "acc_credit", description: "GitHub Pro", category: "Subscriptions", amount: -4.0 },
  // Shopping
  { daysAgo: 9, accountId: "acc_credit", description: "IKEA", category: "Shopping", amount: -129.0 },
  { daysAgo: 20, accountId: "acc_credit", description: "Zalando", category: "Shopping", amount: -74.95 },
  // Health
  { daysAgo: 13, accountId: "acc_current", description: "Apotheke", category: "Health", amount: -23.4 },
  { daysAgo: 27, accountId: "acc_current", description: "Fitinn — membership", category: "Health", amount: -24.9 },
  // Transfers (moved to savings — excluded from spend)
  { daysAgo: 2, accountId: "acc_current", description: "Transfer to Savings", category: "Transfers", amount: -800.0 },
  { daysAgo: 33, accountId: "acc_current", description: "Transfer to Savings", category: "Transfers", amount: -800.0 },
];

export const demoTransactions: Transaction[] = transactionTemplates
  .map((t, i) => ({
    id: `txn_${String(i + 1).padStart(3, "0")}`,
    date: isoDaysAgo(t.daysAgo),
    accountId: t.accountId,
    description: t.description,
    category: t.category,
    amount: t.amount,
  }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

// ---------------------------------------------------------------------------
// Portfolio + net-worth history, both derived from the numbers above so the
// dashboard is internally consistent.
// ---------------------------------------------------------------------------

export function demoPortfolio(): Portfolio {
  return {
    cash: BROKERAGE_CASH,
    currency: CURRENCY,
    positions: demoPositions,
    asOf: new Date().toISOString(),
  };
}

function currentNetWorth(): number {
  const bank = demoAccounts.reduce((s, a) => s + a.balance, 0);
  const invested = demoPositions.reduce((s, p) => s + p.quantity * p.lastPrice, 0);
  const assets = demoAssets.reduce((s, a) => s + a.value - (a.liability ?? 0), 0);
  return bank + invested + BROKERAGE_CASH + assets;
}

export function demoNetWorthHistory(): NetWorthPoint[] {
  const current = currentNetWorth();
  const months = 12;
  const start = current * 0.72;
  // Fixed wobble so the curve looks organic; last entry is 0 to land exactly on
  // today's real net worth.
  const wobble = [0, 900, -1200, 700, 1900, -600, 1400, -900, 2200, 400, -700, 0];

  return Array.from({ length: months }, (_, i) => {
    const trend = start + (current - start) * (i / (months - 1));
    return {
      date: isoFirstOfMonth(months - 1 - i),
      netWorth: Math.round(trend + wobble[i]),
    };
  });
}
