// Transaction feed, optionally filtered by ?month=YYYY-MM and/or ?category=.

import { bankProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");

  if (month !== null && !/^\d{4}-\d{2}$/.test(month)) {
    return Response.json(
      { error: '"month" must be in YYYY-MM format' },
      { status: 400 },
    );
  }

  let transactions = await bankProvider().getTransactions();
  if (month) {
    transactions = transactions.filter((t) => t.date.startsWith(month));
  }
  if (category) {
    const wanted = category.toLowerCase();
    transactions = transactions.filter((t) => t.category.toLowerCase() === wanted);
  }

  return Response.json({ count: transactions.length, transactions });
}
