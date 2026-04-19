"use client";

import { Sidebar } from "@/components/Sidebar";
import { AIAdvisor } from "@/components/AIAdvisor";

export default function AIAdvisorPage() {
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      <main className="flex-1 p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">AI Wealth Advisor</h1>
        <p className="text-zinc-500 font-medium mb-12">Talk to our artificial intelligence for smart financial growth.</p>
        <AIAdvisor />
      </main>
    </div>
  );
}
