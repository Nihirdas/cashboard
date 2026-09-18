import { loadLocalDividends } from "@/lib/providers/dividends/local";
import { demoDividends } from "@/lib/demo/dividends";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { StatCard, StatCardWithDelta } from "@/components/StatCard";
import { Badge, Card } from "@/components/ui";
import { MonthlyDividendChart, DividendProjection } from "@/components/DividendCharts";

export const dynamic = "force-dynamic";

export default async function DividendsPage() {
  // Real numbers from the git-ignored local file when present; demo otherwise.
  const real = await loadLocalDividends();
  const data = real ?? demoDividends;
  const isReal = real !== null;
  const cur = data.currency || "EUR";

  const monthly = [...data.monthly].sort((a, b) => (a.month < b.month ? -1 : 1));
  const yearly = [...data.yearly].sort((a, b) => a.year - b.year);
  const latest = yearly[yearly.length - 1];
  const prev = yearly.length > 1 ? yearly[yearly.length - 2] : null;

  // Same-period helpers so a year still in progress isn't compared to a full one.
  const monthNumsOf = (yr: number) =>
    new Set(monthly.filter((m) => m.month.startsWith(`${yr}`)).map((m) => m.month.slice(5)));
  const sumSamePeriod = (yr: number, nums: Set<string>) =>
    monthly
      .filter((m) => m.month.startsWith(`${yr}`) && nums.has(m.month.slice(5)))
      .reduce((s, m) => s + m.dividend, 0);

  const isPartial =
    monthNumsOf(latest.year).size > 0 && monthNumsOf(latest.year).size < 12;
  const priorBase = prev ? sumSamePeriod(prev.year, monthNumsOf(latest.year)) : 0;
  const yoy = isPartial
    ? priorBase > 0 ? (latest.dividend - priorBase) / priorBase : null
    : prev && prev.dividend ? (latest.dividend - prev.dividend) / prev.dividend : null;
  const yoyDelta = isPartial ? latest.dividend - priorBase : latest.dividend - (prev?.dividend ?? 0);
  const yoyHint = isPartial ? "vs same period last year" : "vs last year";

  const monthlyAvg = data.summary.monthlyAverage;
  // Reconciled all-time total: the latest cumulative figure (or the sum of every
  // month), not the possibly-stale snapshot in summary.totalDividend.
  const totalReceived =
    yearly[yearly.length - 1]?.cumulativeDividend ??
    (monthly.length
      ? monthly.reduce((s, m) => s + m.dividend, 0)
      : data.summary.totalDividend);
  const annualRunRate = monthlyAvg * 12;
  const worth = data.summary.totalWorth || data.summary.totalInvested || 0;
  const defaultYieldPct = worth > 0 ? (annualRunRate / worth) * 100 : 6;
  const startYear = new Date().getFullYear();

  // Nearest monthly-income target we haven't hit yet.
  const target = data.milestones
    .map((m) => m.monthlyDividendTarget)
    .filter((t): t is number => t != null && t > monthlyAvg)
    .sort((a, b) => a - b)[0];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dividends</h1>
          <p className="mt-1 text-sm text-muted">
            Passive income from your portfolio · since {formatDate(data.startDate)}
          </p>
        </div>
        <Badge className={isReal ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-brand/10 text-brand"}>
          {isReal ? "Your data · private" : "Demo data"}
        </Badge>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total received" value={formatCurrency(totalReceived, cur)} hint="all time" />
        <StatCard label="Monthly average" value={`${formatCurrency(monthlyAvg, cur)}`} hint="per month" />
        <StatCard
          label={`${latest.year} dividends${isPartial ? " · YTD" : ""}`}
          value={formatCurrency(latest.dividend, cur)}
          hint={isPartial ? "year to date" : "this year"}
        />
        {yoy !== null ? (
          <StatCardWithDelta
            label="Year on year"
            value={formatPercent(yoy)}
            deltaText={`${formatCurrency(yoyDelta, cur)}`}
            positive={yoy >= 0}
            hint={yoyHint}
          />
        ) : (
          <StatCard label="Invested" value={formatCurrency(data.summary.totalInvested, cur)} />
        )}
      </section>

      {target && (
        <Card className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Toward {formatCurrency(target, cur)}/mo</span>
            <span className="tnum text-muted">
              {formatCurrency(monthlyAvg, cur)} / {formatCurrency(target, cur)} ·{" "}
              {Math.round((monthlyAvg / target) * 100)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.min(100, (monthlyAvg / target) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold">Monthly dividend income</h2>
        <MonthlyDividendChart data={monthly} />
      </Card>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Year on year</h2>
          <ul className="space-y-2.5">
            {yearly.map((y, i) => {
              const p = i > 0 ? yearly[i - 1] : null;
              const partial = y.year === latest.year && isPartial;
              const base = p ? (partial ? sumSamePeriod(p.year, monthNumsOf(y.year)) : p.dividend) : 0;
              const g = base ? (y.dividend - base) / base : null;
              return (
                <li key={y.year} className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {y.year}
                    {partial ? " · YTD" : ""}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tnum font-medium">{formatCurrency(y.dividend, cur)}</span>
                    {g !== null && (
                      <span
                        className={`tnum text-xs ${g >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {formatPercent(g)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-3 p-0">
          <h2 className="p-5 pb-3 text-sm font-semibold">Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2 font-medium">Symbol</th>
                  <th className="px-5 py-2 text-right font-medium">Shares</th>
                  <th className="px-5 py-2 text-right font-medium">Received</th>
                  <th className="hidden px-5 py-2 text-right font-medium sm:table-cell">Yield</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((h) => {
                  const y = h.dividendReceived && h.invested ? h.dividendReceived / h.invested : null;
                  return (
                    <tr key={h.symbol} className="border-b border-line last:border-0">
                      <td className="px-5 py-2.5">
                        <div className="font-semibold">{h.symbol}</div>
                        {h.notes && <div className="text-xs text-muted">{h.notes}</div>}
                      </td>
                      <td className="px-5 py-2.5 text-right tnum">{h.shares ?? "—"}</td>
                      <td className="px-5 py-2.5 text-right tnum">
                        {h.dividendReceived != null ? formatCurrency(h.dividendReceived, cur) : "—"}
                      </td>
                      <td className="hidden px-5 py-2.5 text-right tnum text-muted sm:table-cell">
                        {y != null ? `${(y * 100).toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
                {data.holdings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-muted">
                      No holdings recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <h2 className="mb-1 text-sm font-semibold">Projection</h2>
        <p className="mb-4 text-xs text-muted">
          The DRIP snowball — reinvested dividends buy more shares, which pay more
          dividends.
        </p>
        <DividendProjection
          startAnnual={annualRunRate}
          startYear={startYear}
          defaultYieldPct={defaultYieldPct}
        />
      </Card>
    </>
  );
}
