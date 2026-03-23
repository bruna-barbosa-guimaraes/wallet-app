// app/transfer/page.tsx
import { transferAction } from "@/app/actions/transactions";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TransferPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // await garante compatibilidade tanto com Next.js 14 (objeto) quanto 15 (Promise)
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-center mb-6">Transferir</h1>

        {error === "insufficient_balance" && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-md">
            <p className="font-bold">Saldo insuficiente</p>
            <p className="text-sm">
              Você não tem saldo disponível para realizar esta transferência.
            </p>
          </div>
        )}

        {error === "user_not_found" && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-md">
            <p className="font-bold">Usuário não encontrado</p>
            <p className="text-sm">
              O ID do destinatário informado não existe. Verifique e tente
              novamente.
            </p>
          </div>
        )}

        <form action={transferAction} className="space-y-6">
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ID do destinatário
            </label>
            <input
              id="toUserId"
              name="toUserId"
              type="text"
              required
              className="w-full rounded-md border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor da transferência (R$)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Ex: 50.00"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Confirmar Transferência
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Certifique-se de que o destinatário está cadastrado.
        </p>
      </div>
    </div>
  );
}
