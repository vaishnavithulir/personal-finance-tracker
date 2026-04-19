"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getTransactions(userId: string) {
  try {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
}

export async function addTransaction(formData: FormData, userId: string) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const category = formData.get("category") as string || "Other";

  if (!description || isNaN(amount)) return { error: "Invalid data" };

  try {
    await prisma.transaction.create({
      data: {
        description,
        amount,
        type,
        category,
        userId
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error adding transaction:", err);
    return { error: "Database error" };
  }
}

export async function getStats(userId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      total: income - expense,
      income,
      expense,
      count: transactions.length
    };
  } catch (err) {
    return { total: 0, income: 0, expense: 0, count: 0 };
  }
}
