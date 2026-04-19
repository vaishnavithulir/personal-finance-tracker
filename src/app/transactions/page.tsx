"use client";

import { Sidebar } from "@/components/Sidebar";

export default function TransactionsPage() {
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Transactions</h1>
        <p className="text-zinc-500 font-medium">History of all your financial movements.</p>
        <div className="glass-card p-10 mt-10 text-center text-zinc-500">
          Sync with your financial institutions or add manually in the Dashboard.
        </div>
      </main>
    </div>
  );
}
