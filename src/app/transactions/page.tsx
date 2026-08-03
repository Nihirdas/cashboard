import { bankProvider } from "@/lib/providers";
import { TransactionsTable } from "@/components/TransactionsTable";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const bank = bankProvider();
  const [accounts, transactions] = await Promise.all([
    bank.getAccounts(),
    bank.getTransactions(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted">
          Search and filter across all accounts
        </p>
      </div>
      <TransactionsTable transactions={transactions} accounts={accounts} />
    </>
  );
}
