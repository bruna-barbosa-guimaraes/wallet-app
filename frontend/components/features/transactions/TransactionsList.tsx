"use client";

import { reverseTransactionAction } from "@/app/actions/transactions";
import { useState } from "react";

export type Transaction = {
  id: string;
  amount: string;
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";
  status: "PENDING" | "COMPLETED" | "REVERSED" | "FAILED";
  senderId?: string;
  receiverId?: string;
  createdAt: string;
};

interface TransactionsListProps {
  initialTransactions: Transaction[];
}

export default function TransactionsList({
  initialTransactions,
}: TransactionsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReverse = async (transactionId: string) => {
    if (!confirm("Deseja reverter esta transação?")) return;

    setLoadingId(transactionId);
    const result = await reverseTransactionAction(transactionId);
    setLoadingId(null);

    if (result?.error) {
      alert(result.error);
    } else {
      alert("Transação revertida com sucesso!");
    }
  };

  if (initialTransactions.length === 0) {
    return <p className="text-gray-500">Nenhuma transação encontrada.</p>;
  }

  return (
    <ul className="space-y-4">
      {initialTransactions.map((tx) => (
        <li
          key={tx.id}
          className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {tx.type === "DEPOSIT" ? "Depósito" : "Transferência"}
            </p>
            <p className="text-gray-600">R$ {tx.amount}</p>
            <p className="text-sm text-gray-400">
              {new Date(tx.createdAt).toLocaleString()} -{" "}
              <span className={tx.status === "REVERSED" ? "text-red-500" : ""}>
                {tx.status === "COMPLETED"
                  ? "Concluído"
                  : tx.status === "REVERSED"
                    ? "Revertido"
                    : tx.status}
              </span>
            </p>
          </div>
          {tx.status === "COMPLETED" && (
            <button
              onClick={() => handleReverse(tx.id)}
              disabled={loadingId === tx.id}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loadingId === tx.id ? "..." : "Reverter"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
