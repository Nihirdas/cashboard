// Demo dividend dataset — fake numbers, shipped in the public repo so the
// Dividends page renders for anyone. Real data comes from .data/dividends.json
// (git-ignored) when present. Shape matches DividendData exactly.

import type { DividendData, DividendMonth } from "@/lib/providers/types";

function buildMonthly(): DividendMonth[] {
  const out: DividendMonth[] = [];
  let cumulative = 0;
  let invested = 5000;
  const base = 36;
  for (let i = 0; i < 24; i++) {
    const year = 2024 + Math.floor(i / 12);
    const month = (i % 12) + 1;
    // steady growth + a small quarter-end bump
    const dividend =
      Math.round((base * (1 + i * 0.025) + (month % 3 === 0 ? 20 : 0)) * 100) / 100;
    cumulative = Math.round((cumulative + dividend) * 100) / 100;
    invested += 250;
    out.push({
      month: `${year}-${String(month).padStart(2, "0")}`,
      dividend,
      cumulativeDividend: cumulative,
      invested,
      worth: Math.round(invested * 1.06),
      monthlyAverage: Math.round((cumulative / (i + 1)) * 100) / 100,
      returnPct: null,
    });
  }
  return out;
}

const monthly = buildMonthly();
const sumYear = (y: number) =>
  Math.round(
    monthly
      .filter((m) => m.month.startsWith(String(y)))
      .reduce((s, m) => s + m.dividend, 0) * 100,
  ) / 100;
const totalDividend = Math.round((210 + sumYear(2024) + sumYear(2025)) * 100) / 100;
const lastInvested = monthly[monthly.length - 1].invested ?? 11000;

export const demoDividends: DividendData = {
  currency: "EUR",
  startDate: "2023-02-15",
  summary: {
    totalInvested: lastInvested,
    totalDividend,
    totalWorth: Math.round(lastInvested * 1.06),
    monthlyAverage: Math.round((totalDividend / (monthly.length + 6)) * 100) / 100,
  },
  yearly: [
    { year: 2023, dividend: 210, cumulativeDividend: 210, invested: 3000, worth: 3120, returnPct: 4.0 },
    { year: 2024, dividend: sumYear(2024), cumulativeDividend: 210 + sumYear(2024), invested: 6000, worth: 6360, returnPct: 6.0 },
    { year: 2025, dividend: sumYear(2025), cumulativeDividend: totalDividend, invested: lastInvested, worth: Math.round(lastInvested * 1.06), returnPct: 6.2 },
  ],
  monthly,
  holdings: [
    { symbol: "JEPQ", shares: 120, invested: 5400, dividendReceived: 540, exDate: null, notes: "Monthly income ETF" },
    { symbol: "SCHD", shares: 60, invested: 4200, dividendReceived: 190, exDate: null, notes: "Dividend growth" },
    { symbol: "O", shares: 40, invested: 2200, dividendReceived: 130, exDate: null, notes: "Monthly REIT" },
    { symbol: "OXLC", shares: 150, invested: 1000, dividendReceived: 180, exDate: null, notes: "High-yield CEF" },
  ],
  milestones: [
    { year: 2025, cumulativeDividendTarget: 1500, monthlyDividendTarget: 100, investedTarget: 12000 },
    { year: 2026, cumulativeDividendTarget: 3000, monthlyDividendTarget: 150, investedTarget: 18000 },
    { year: 2027, cumulativeDividendTarget: 5500, monthlyDividendTarget: 250, investedTarget: 25000 },
  ],
};
