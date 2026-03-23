// app/deposit/page.tsx
import { depositAction } from "@/app/actions/transactions";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DepositPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-center mb-6">Depositar</h1>

        {/* Formulário que chama Server Action */}
        <form action={depositAction} className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor do depósito (R$)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Ex: 100.00"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            Confirmar Depósito
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Valor mínimo: R$ 0,01
        </p>
      </div>
    </div>
  );
}
