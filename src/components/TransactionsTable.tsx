"use client";

import { useMemo, useState } from "react";
import type { Account, Transaction } from "@/lib/providers/types";
import { formatDate, formatSigned } from "@/lib/format";
import { Badge, categoryColor } from "@/components/ui";

export function TransactionsTable({
  transactions,
  accounts,
}: {
  transactions: Transaction[];
  accounts: Account[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const accountName = useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts],
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(transactions.map((t) => t.category))).sort()],
    [transactions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [transactions, query, category]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search transactions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Account</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 text-muted tnum">
                  {formatDate(t.date)}
                </td>
                <td className="px-4 py-2.5 font-medium">{t.description}</td>
                <td className="px-4 py-2.5">
                  <Badge className="gap-1.5 bg-surface-2">
                    <span
                      className={`h-2 w-2 rounded-full ${categoryColor(t.category)}`}
                    />
                    {t.category}
                  </Badge>
                </td>
                <td className="hidden px-4 py-2.5 text-muted sm:table-cell">
                  {accountName.get(t.accountId)}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-2.5 text-right font-medium tnum ${
                    t.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                >
                  {formatSigned(t.amount, "EUR", 2)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        Showing {filtered.length} of {transactions.length} transactions
      </p>
    </div>
  );
}
