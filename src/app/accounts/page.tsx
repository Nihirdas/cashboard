import { bankProvider } from "@/lib/providers";
import { bankTotal, cashTotal, debtTotal } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Badge, Card } from "@/components/ui";
import type { AccountType } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<AccountType, string> = {
  current: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  savings: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  investment: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  credit: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const TYPE_LABEL: Record<AccountType, string> = {
  current: "Current",
  savings: "Savings",
  investment: "Investment",
  credit: "Credit",
};

export default async function AccountsPage() {
  const accounts = await bankProvider().getAccounts();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-1 text-sm text-muted">
          {accounts.length} connected accounts
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Cash & savings" value={formatCurrency(cashTotal(accounts))} />
        <StatCard label="Credit / debt" value={formatCurrency(debtTotal(accounts))} />
        <StatCard label="Net bank position" value={formatCurrency(bankTotal(accounts))} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.name}</span>
                <Badge className={TYPE_STYLES[a.type]}>{TYPE_LABEL[a.type]}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{a.institution}</p>
            </div>
            <span
              className={`text-lg font-semibold tnum ${
                a.balance < 0 ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              {formatCurrency(a.balance, a.currency, 2)}
            </span>
          </Card>
        ))}
      </section>
    </>
  );
}
