import { describe, it, expect } from "vitest";
import {
  assetsEquity,
  bankTotal,
  cashTotal,
  debtTotal,
  incomeThisMonth,
  netWorth,
  portfolioCost,
  portfolioPL,
  portfolioValue,
  positionMarketValue,
  positionPL,
  positionPLPct,
  spendByCategory,
  spendThisMonth,
} from "@/lib/finance";
import type { Account, Asset, Portfolio, Position, Transaction } from "@/lib/providers/types";

const accounts: Account[] = [
  { id: "cur", name: "Current", institution: "Bank", type: "current", currency: "EUR", balance: 1_000 },
  { id: "sav", name: "Savings", institution: "Bank", type: "savings", currency: "EUR", balance: 500 },
  { id: "cc", name: "Card", institution: "Bank", type: "credit", currency: "EUR", balance: -200 },
  { id: "inv", name: "Broker cash", institution: "Bank", type: "investment", currency: "EUR", balance: 300 },
];

const positions: Position[] = [
  { symbol: "AAA", name: "Aaa", quantity: 10, avgPrice: 10, lastPrice: 12 }, // mv 120, cost 100, pl 20
  { symbol: "BBB", name: "Bbb", quantity: 5, avgPrice: 20, lastPrice: 18 }, // mv 90, cost 100, pl -10
];

const portfolio: Portfolio = {
  cash: 100,
  currency: "EUR",
  asOf: "2026-01-01T00:00:00.000Z",
  positions,
};

const assets: Asset[] = [
  { id: "flat", name: "Flat", kind: "property", currency: "EUR", value: 300_000, liability: 200_000 },
  { id: "pension", name: "Pension", kind: "pension", currency: "EUR", value: 50_000 },
];

describe("position maths", () => {
  it("market value, P/L and P/L%", () => {
    expect(positionMarketValue(positions[0])).toBe(120);
    expect(positionPL(positions[0])).toBe(20);
    expect(positionPLPct(positions[0])).toBeCloseTo(0.2);
    expect(positionPL(positions[1])).toBe(-10);
  });

  it("guards against a zero cost basis", () => {
    expect(positionPLPct({ symbol: "Z", name: "Z", quantity: 1, avgPrice: 0, lastPrice: 5 })).toBe(0);
  });
});

describe("portfolio maths", () => {
  it("value, cost and P/L include brokerage cash", () => {
    expect(portfolioValue(portfolio)).toBe(100 + 120 + 90);
    expect(portfolioCost(portfolio)).toBe(100 + 100 + 100);
    expect(portfolioPL(portfolio)).toBe(10);
  });
});

describe("account totals", () => {
  it("cash is current + savings only", () => {
    expect(cashTotal(accounts)).toBe(1_500);
  });
  it("bank total is every balance, debt included", () => {
    expect(bankTotal(accounts)).toBe(1_600);
  });
  it("debt total is negative balances only", () => {
    expect(debtTotal(accounts)).toBe(-200);
  });
});

describe("assets and net worth", () => {
  it("equity is value minus liability", () => {
    expect(assetsEquity(assets)).toBe(150_000);
  });
  it("net worth combines bank, portfolio and asset equity", () => {
    expect(netWorth(accounts, portfolio, assets)).toBe(1_600 + 310 + 150_000);
  });
  it("net worth defaults assets to none", () => {
    expect(netWorth(accounts, portfolio)).toBe(1_600 + 310);
  });
});

describe("monthly aggregations (fixed reference date, timezone-safe)", () => {
  const ref = new Date(2026, 5, 15); // June 2026, constructed locally — no UTC edge
  const transactions: Transaction[] = [
    { id: "1", accountId: "cur", date: "2026-06-10", description: "Salary", category: "Income", amount: 3_000 },
    { id: "2", accountId: "cur", date: "2026-06-12", description: "Rent", category: "Housing", amount: -1_000 },
    { id: "3", accountId: "cur", date: "2026-06-14", description: "Groceries", category: "Groceries", amount: -200 },
    { id: "4", accountId: "cur", date: "2026-06-16", description: "Groceries", category: "Groceries", amount: -100 },
    { id: "5", accountId: "cur", date: "2026-06-11", description: "To savings", category: "Transfers", amount: -500 },
    { id: "6", accountId: "cur", date: "2026-06-13", description: "Refund", category: "Shopping", amount: 50 },
    { id: "7", accountId: "cur", date: "2026-05-15", description: "Old rent", category: "Housing", amount: -1_000 },
    { id: "8", accountId: "cur", date: "2026-07-15", description: "Next salary", category: "Income", amount: 1_000 },
  ];

  it("spend excludes income, transfers, positives and other months", () => {
    expect(spendThisMonth(transactions, ref)).toBe(1_300);
  });
  it("income counts only this month's income", () => {
    expect(incomeThisMonth(transactions, ref)).toBe(3_000);
  });
  it("spend by category is grouped and sorted, biggest first", () => {
    expect(spendByCategory(transactions, ref)).toEqual([
      { category: "Housing", amount: 1_000 },
      { category: "Groceries", amount: 300 },
    ]);
  });
  it("an empty feed yields no spend", () => {
    expect(spendThisMonth([], ref)).toBe(0);
    expect(spendByCategory([], ref)).toEqual([]);
  });
});
