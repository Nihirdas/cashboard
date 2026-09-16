// Current net worth plus the 12-month history the overview chart uses.

import { assetsProvider, bankProvider, tradingProvider } from "@/lib/providers";
import { netWorth } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const bank = bankProvider();
  const [accounts, portfolio, assets, history] = await Promise.all([
    bank.getAccounts(),
    tradingProvider().getPortfolio(),
    assetsProvider().getAssets(),
    bank.getNetWorthHistory(),
  ]);

  return Response.json({
    current: netWorth(accounts, portfolio, assets),
    history,
  });
}
