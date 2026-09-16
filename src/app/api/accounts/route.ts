// Bank accounts + the balance totals the dashboard derives from them.

import { bankProvider } from "@/lib/providers";
import { bankTotal, cashTotal, debtTotal } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const accounts = await bankProvider().getAccounts();

  return Response.json({
    accounts,
    totals: {
      bank: bankTotal(accounts),
      cash: cashTotal(accounts),
      debt: debtTotal(accounts),
    },
  });
}
