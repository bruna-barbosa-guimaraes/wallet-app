import { getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";
import LogoutButton from "@/components/features/auth/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Não autorizado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Bem-vindo, {user.name || user.email}
          </h1>
          <LogoutButton className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50" />
        </div>

        <div className="mt-8 rounded-lg bg-white p-8 shadow">
          <div className="text-center">
            <p className="text-lg text-gray-600">Saldo atual</p>
            <p className="mt-2 text-5xl font-bold text-green-600">
              R$ {Number(user.balance || 0).toFixed(2)}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Link
              href="/deposit"
              className="flex flex-col items-center rounded-lg border p-6 text-center hover:bg-gray-50"
            >
              <span className="text-2xl">💰</span>
              <h3 className="mt-4 text-xl font-semibold">Depositar</h3>
            </Link>

            <Link
              href="/transfer"
              className="flex flex-col items-center rounded-lg border p-6 text-center hover:bg-gray-50"
            >
              <span className="text-2xl">↔️</span>
              <h3 className="mt-4 text-xl font-semibold">Transferir</h3>
            </Link>

            <Link
              href="/transactions"
              className="flex flex-col items-center rounded-lg border p-6 text-center hover:bg-gray-50"
            >
              <span className="text-2xl">📄</span>
              <h3 className="mt-4 text-xl font-semibold">Minhas Transações</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
