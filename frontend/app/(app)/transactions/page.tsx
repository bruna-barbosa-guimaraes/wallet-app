import { getCurrentUser } from "@/app/actions/auth";
import { getTransactionsAction } from "@/app/actions/transactions";
import TransactionsList from "@/components/features/transactions/TransactionsList";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsAction();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-6">Minhas Transações</h1>
        <TransactionsList initialTransactions={transactions} />
      </div>
    </div>
  );
}
