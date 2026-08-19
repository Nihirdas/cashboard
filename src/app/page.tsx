import { assetsProvider, bankProvider, tradingProvider } from "@/lib/providers";
import {
  cashTotal,
  incomeThisMonth,
  netWorth,
  portfolioPL,
  portfolioValue,
  spendByCategory,
  spendThisMonth,
} from "@/lib/finance";
import { formatCurrency, formatDate, formatPercent, formatSigned } from "@/lib/format";
import { StatCard, StatCardWithDelta } from "@/components/StatCard";
import { NetWorthChart } from "@/components/NetWorthChart";
import { CategoryBars } from "@/components/CategoryBars";
import { Badge, Card, categoryColor } from "@/components/ui";
import { Composition } from "@/components/Composition";

// Demo data is generated relative to "now", so render per-request to keep the
// live demo current instead of frozen at build time.
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const bank = bankProvider();
  const trading = tradingProvider();

  const [accounts, transactions, portfolio, history, assets] = await Promise.all([
    bank.getAccounts(),
    bank.getTransactions(),
    trading.getPortfolio(),
    bank.getNetWorthHistory(),
    assetsProvider().getAssets(),
  ]);

  const nw = netWorth(accounts, portfolio, assets);
  const invested = portfolioValue(portfolio);
  const pl = portfolioPL(portfolio);
  const spend = spendThisMonth(transactions);
  const income = incomeThisMonth(transactions);
  const categories = spendByCategory(transactions).slice(0, 6);

  const prev = history.length > 1 ? history[history.length - 2].netWorth : nw;
  const momDelta = nw - prev;
  const momPct = prev !== 0 ? momDelta / prev : 0;

  const accountName = new Map(accounts.map((a) => [a.id, a.name]));
  const recent = transactions.slice(0, 7);

  const propertyEquity = assets
    .filter((a) => a.kind === "property")
    .reduce((s, a) => s + a.value - (a.liability ?? 0), 0);
  const pension = assets
    .filter((a) => a.kind === "pension")
    .reduce((s, a) => s + a.value - (a.liability ?? 0), 0);
  const otherAssets = assets
    .filter((a) => a.kind !== "property" && a.kind !== "pension")
    .reduce((s, a) => s + a.value - (a.liability ?? 0), 0);
  const composition = [
    { label: "Cash & savings", value: cashTotal(accounts), color: "bg-sky-500" },
    { label: "Investments", value: invested, color: "bg-emerald-500" },
    { label: "Property", value: propertyEquity, color: "bg-violet-500" },
    { label: "Pension", value: pension, color: "bg-amber-500" },
    { label: "Other", value: otherAssets, color: "bg-rose-500" },
  ];

  return (
    <>
      <PageHeaderRow />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCardWithDelta
          label="Net worth"
          value={formatCurrency(nw)}
          deltaText={`${formatSigned(momDelta)} (${formatPercent(momPct)})`}
          positive={momDelta >= 0}
          hint="vs last month"
        />
        <StatCard
          label="Cash & savings"
          value={formatCurrency(cashTotal(accounts))}
          hint={`across ${accounts.filter((a) => a.balance >= 0).length} accounts`}
        />
        <StatCardWithDelta
          label="Investments"
          value={formatCurrency(invested)}
          deltaText={formatSigned(pl)}
          positive={pl >= 0}
          hint="unrealised P/L"
        />
        <StatCard
          label="Spent this month"
          value={formatCurrency(spend)}
          hint={`${formatCurrency(income)} in`}
        />
      </section>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold">What you own</h2>
        <Composition segments={composition} />
      </Card>

      <Card className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Net worth</h2>
          <span className="text-xs text-muted">last 12 months</span>
        </div>
        <NetWorthChart data={history} />
      </Card>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold">Recent transactions</h2>
          <ul className="divide-y divide-line">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`h-8 w-8 shrink-0 rounded-full ${categoryColor(t.category)} opacity-90`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted">
                    {accountName.get(t.accountId)} · {formatDate(t.date)}
                  </p>
                </div>
                <span
                  className={`tnum text-sm font-medium ${
                    t.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                >
                  {formatSigned(t.amount, "EUR", 2)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Spending this month</h2>
            <Badge className="bg-surface-2 text-muted">
              {formatCurrency(spend)}
            </Badge>
          </div>
          <CategoryBars items={categories} />
        </Card>
      </section>
    </>
  );
}

function PageHeaderRow() {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          As of {formatDate(new Date().toISOString())}
        </p>
      </div>
      <Badge className="bg-brand/10 text-brand">Demo data</Badge>
    </div>
  );
}
