// The overview tiles as one payload: net worth (+ month-over-month), cash,
// investments (+ P/L), and this month's spend/income.

import { assetsProvider, bankProvider, tradingProvider } from "@/lib/providers";
import {
  cashTotal,
  incomeThisMonth,
  netWorth,
  portfolioPL,
  portfolioValue,
  spendThisMonth,
} from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const bank = bankProvider();
  const [accounts, transactions, portfolio, history, assets] = await Promise.all([
    bank.getAccounts(),
    bank.getTransactions(),
    tradingProvider().getPortfolio(),
    bank.getNetWorthHistory(),
    assetsProvider().getAssets(),
  ]);

  const nw = netWorth(accounts, portfolio, assets);
  const prev = history.length > 1 ? history[history.length - 2].netWorth : nw;
  const momDelta = nw - prev;

  return Response.json({
    netWorth: nw,
    cash: cashTotal(accounts),
    investments: portfolioValue(portfolio),
    investmentsPL: portfolioPL(portfolio),
    spendThisMonth: spendThisMonth(transactions),
    incomeThisMonth: incomeThisMonth(transactions),
    momDelta,
    momPct: prev !== 0 ? momDelta / prev : 0,
    asOf: new Date().toISOString(),
  });
}
