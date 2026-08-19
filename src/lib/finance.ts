// Pure aggregation helpers. Given raw provider data (accounts, transactions,
// portfolio), these compute the derived numbers the dashboard displays. Kept
// separate from the providers so the maths is easy to test and reuse.

import type {
  Account,
  Asset,
  Portfolio,
  Position,
  Transaction,
} from "@/lib/providers/types";

export const EXCLUDED_FROM_SPEND = new Set(["Income", "Transfers"]);

export function positionMarketValue(p: Position): number {
  return p.quantity * p.lastPrice;
}

export function positionCost(p: Position): number {
  return p.quantity * p.avgPrice;
}

export function positionPL(p: Position): number {
  return positionMarketValue(p) - positionCost(p);
}

export function positionPLPct(p: Position): number {
  const cost = positionCost(p);
  return cost === 0 ? 0 : positionPL(p) / cost;
}

export function portfolioValue(pf: Portfolio): number {
  return pf.cash + pf.positions.reduce((s, p) => s + positionMarketValue(p), 0);
}

export function portfolioCost(pf: Portfolio): number {
  return pf.cash + pf.positions.reduce((s, p) => s + positionCost(p), 0);
}

export function portfolioPL(pf: Portfolio): number {
  return pf.positions.reduce((s, p) => s + positionPL(p), 0);
}

/** Cash + savings (positive real-money balances). */
export function cashTotal(accounts: Account[]): number {
  return accounts
    .filter((a) => a.type === "current" || a.type === "savings")
    .reduce((s, a) => s + a.balance, 0);
}

/** Sum of every bank balance, including credit-card debt (negative). */
export function bankTotal(accounts: Account[]): number {
  return accounts.reduce((s, a) => s + a.balance, 0);
}

export function debtTotal(accounts: Account[]): number {
  return accounts
    .filter((a) => a.balance < 0)
    .reduce((s, a) => s + a.balance, 0);
}

/** Equity across non-bank assets: value minus any loan secured against it. */
export function assetsEquity(assets: Asset[]): number {
  return assets.reduce((s, a) => s + a.value - (a.liability ?? 0), 0);
}

export function netWorth(
  accounts: Account[],
  pf: Portfolio,
  assets: Asset[] = [],
): number {
  return bankTotal(accounts) + portfolioValue(pf) + assetsEquity(assets);
}

function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/** Total spent (as a positive number) this calendar month. */
export function spendThisMonth(transactions: Transaction[], ref = new Date()): number {
  return transactions
    .filter(
      (t) =>
        t.amount < 0 &&
        !EXCLUDED_FROM_SPEND.has(t.category) &&
        isSameMonth(t.date, ref),
    )
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

/** Total income this calendar month. */
export function incomeThisMonth(transactions: Transaction[], ref = new Date()): number {
  return transactions
    .filter((t) => t.category === "Income" && isSameMonth(t.date, ref))
    .reduce((s, t) => s + t.amount, 0);
}

export interface CategorySpend {
  category: string;
  amount: number;
}

/** Spending grouped by category for the current month, largest first. */
export function spendByCategory(
  transactions: Transaction[],
  ref = new Date(),
): CategorySpend[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0 || EXCLUDED_FROM_SPEND.has(t.category)) continue;
    if (!isSameMonth(t.date, ref)) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}
