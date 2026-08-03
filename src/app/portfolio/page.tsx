import { tradingProvider } from "@/lib/providers";
import {
  portfolioCost,
  portfolioPL,
  portfolioValue,
  positionMarketValue,
  positionPL,
  positionPLPct,
} from "@/lib/finance";
import { formatCurrency, formatPercent, formatSigned } from "@/lib/format";
import { StatCard, StatCardWithDelta } from "@/components/StatCard";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const ALLOC = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export default async function PortfolioPage() {
  const portfolio = await tradingProvider().getPortfolio();

  const value = portfolioValue(portfolio);
  const cost = portfolioCost(portfolio);
  const pl = portfolioPL(portfolio);
  const plPct = cost !== 0 ? pl / cost : 0;

  const invested = value - portfolio.cash;
  const positions = [...portfolio.positions].sort(
    (a, b) => positionMarketValue(b) - positionMarketValue(a),
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">
          {positions.length} holdings · paper trading
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Portfolio value" value={formatCurrency(value)} />
        <StatCardWithDelta
          label="Total return"
          value={formatSigned(pl)}
          deltaText={formatPercent(plPct)}
          positive={pl >= 0}
          hint="vs cost"
        />
        <StatCard label="Invested" value={formatCurrency(cost)} />
        <StatCard label="Cash" value={formatCurrency(portfolio.cash)} />
      </section>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Allocation</h2>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
          {positions.map((p, i) => (
            <div
              key={p.symbol}
              className={ALLOC[i % ALLOC.length]}
              style={{ width: `${(positionMarketValue(p) / invested) * 100}%` }}
              title={p.symbol}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
          {positions.map((p, i) => (
            <span key={p.symbol} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${ALLOC[i % ALLOC.length]}`} />
              {p.symbol}{" "}
              {Math.round((positionMarketValue(p) / invested) * 100)}%
            </span>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Qty</th>
                <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                  Avg
                </th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 text-right font-medium">P/L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const gain = positionPL(p);
                return (
                  <tr key={p.symbol} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.symbol}</div>
                      <div className="text-xs text-muted">{p.name}</div>
                    </td>
                    <td className="hidden px-4 py-3 tnum sm:table-cell">
                      {p.quantity}
                    </td>
                    <td className="hidden px-4 py-3 text-right tnum text-muted md:table-cell">
                      {formatCurrency(p.avgPrice, portfolio.currency, 2)}
                    </td>
                    <td className="px-4 py-3 text-right tnum">
                      {formatCurrency(p.lastPrice, portfolio.currency, 2)}
                    </td>
                    <td className="px-4 py-3 text-right tnum font-medium">
                      {formatCurrency(positionMarketValue(p), portfolio.currency)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tnum font-medium ${
                        gain >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatSigned(gain, portfolio.currency)}
                      <div className="text-xs font-normal">
                        {formatPercent(positionPLPct(p))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
