// app/actions/transactions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // ajuste se necessário

export async function depositAction(formData: FormData) {
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Valor inválido. Digite um número maior que zero.");
  }

  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const res = await fetch(`${API_URL}/transactions/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: amountStr }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao realizar depósito");
  }

  // Sucesso: atualiza cache das páginas que mostram saldo
  revalidatePath("/dashboard");
  revalidatePath("/");

  // Redireciona de volta pro dashboard
  redirect("/dashboard?success=deposit");
}

export async function transferAction(formData: FormData) {
  const toUserIdRaw = formData.get("toUserId");
  const amountStrRaw = formData.get("amount");

  const toUserId = typeof toUserIdRaw === "string" ? toUserIdRaw.trim() : "";
  const amountStr = typeof amountStrRaw === "string" ? amountStrRaw.trim() : "";

  if (!toUserId) {
    throw new Error("Informe o UUID do destinatário");
  }

  // Validação de UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(toUserId)) {
    throw new Error("UUID inválido");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Valor inválido. Digite um número maior que zero.");
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${API_URL}/transactions/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      toUserId,
      amount: amountStr,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMessage = "Falha ao realizar transferência";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}

    if (errorMessage === "Saldo insuficiente") {
      redirect("/transfer?error=insufficient_balance");
    }

    if (errorMessage === "Usuário destino não encontrado") {
      redirect("/transfer?error=user_not_found");
    }

    throw new Error(errorMessage);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?success=transfer");
}

export async function getTransactionsAction() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return [];
  }

  const res = await fetch(`${API_URL}/transactions/transactions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  console.log("Resposta da API de transações:", res);

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export async function reverseTransactionAction(transactionId: string) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return { error: "Usuário não autenticado" };
  }

  const res = await fetch(`${API_URL}/transactions/${transactionId}/reverse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return { error: "Falha ao reverter transação" };
  }
  revalidatePath("/transactions");
  return { success: true };
}
