// Investment portfolio with per-position and total P/L.

import { tradingProvider } from "@/lib/providers";
import {
  portfolioCost,
  portfolioPL,
  portfolioValue,
  positionMarketValue,
  positionPL,
  positionPLPct,
} from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await tradingProvider().getPortfolio();

  const positions = portfolio.positions.map((p) => ({
    ...p,
    marketValue: positionMarketValue(p),
    pl: positionPL(p),
    plPct: positionPLPct(p),
  }));

  return Response.json({
    cash: portfolio.cash,
    currency: portfolio.currency,
    asOf: portfolio.asOf,
    positions,
    totals: {
      value: portfolioValue(portfolio),
      cost: portfolioCost(portfolio),
      pl: portfolioPL(portfolio),
    },
  });
}
