"use client";

import { Sidebar } from "@/components/Sidebar";

export default function AnalyticsPage() {
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Deep Analytics</h1>
        <p className="text-zinc-500 font-medium">Advanced charting and data insights for your wealth.</p>
        <div className="glass-card p-10 mt-10 text-center text-zinc-500">
          Analytics dashboard coming soon.
        </div>
      </main>
    </div>
  );
}
