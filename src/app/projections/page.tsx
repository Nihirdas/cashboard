import { assetsProvider, bankProvider, tradingProvider } from "@/lib/providers";
import { netWorth } from "@/lib/finance";
import { ProjectionPanel } from "@/components/ProjectionPanel";

export const dynamic = "force-dynamic";

export default async function ProjectionsPage() {
  const [accounts, portfolio, assets] = await Promise.all([
    bankProvider().getAccounts(),
    tradingProvider().getPortfolio(),
    assetsProvider().getAssets(),
  ]);

  const nw = netWorth(accounts, portfolio, assets);
  const startYear = new Date().getFullYear();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Projections</h1>
        <p className="mt-1 text-sm text-muted">
          Model how your net worth could grow — drag the assumptions
        </p>
      </div>
      <ProjectionPanel currentNetWorth={nw} startYear={startYear} />
    </>
  );
}
