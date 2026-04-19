"use client";

import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  PieChart, 
  Sparkles,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { AIAdvisor } from "@/components/AIAdvisor";

export default function Home() {
  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Wealth Central</h1>
            <p className="text-zinc-500 font-medium">Monitoring your financial intelligence in real-time.</p>
          </div>

          <div className="flex gap-4">
            <div className="glass-card flex items-center px-4 py-2 gap-3 group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <Search className="text-zinc-500 group-focus-within:text-primary transition-colors h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-64 placeholder:text-zinc-600"
              />
            </div>
            
            <button className="bg-primary text-white font-bold px-6 py-2 rounded-2xl flex items-center gap-2 glow-btn">
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in delay-100">
          <StatsCard label="Net Worth" value="₹12,45,200" icon={Wallet} trend={12.5} />
          <StatsCard label="Monthly Income" value="₹2,40,000" icon={ArrowUpCircle} type="success" trend={4.2} />
          <StatsCard label="Total Spent" value="₹85,200" icon={ArrowDownCircle} type="danger" trend={-2.1} />
          <StatsCard label="Savings Rate" value="64.5%" icon={PieChart} type="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-extrabold tracking-tight">Stream Monitoring</h3>
                <div className="flex gap-2">
                  <button className="glass-card px-3 py-1 text-xs font-bold text-zinc-400 hover:text-white transition-colors">7d</button>
                  <button className="glass-card px-3 py-1 text-xs font-bold text-primary bg-primary/10 border-primary/30">30d</button>
                  <button className="glass-card px-4 py-1.5 flex items-center gap-2 text-xs font-bold hover:bg-white/5 transition-colors">
                    <Filter className="w-3 h-3" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Transaction List Placeholder */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold text-zinc-500">
                        {i % 2 === 0 ? "🛍️" : "💼"}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-200">Transaction Item {i}</h4>
                        <p className="text-xs text-zinc-500 font-semibold tracking-wide uppercase">Finance & Investment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold text-lg ${i % 2 === 0 ? 'text-danger' : 'text-success'}`}>
                        {i % 2 === 0 ? "-" : "+"} ₹{ [4500, 1200, 850, 3200, 15000][i-1] || 1000 }
                      </p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="space-y-8">
            <AIAdvisor />

            {/* Quick Actions Card */}
            <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-primary mb-4">Quick Insights</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                  <p className="text-xs text-zinc-400 font-medium">Emergency fund target 85% complete.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-danger mt-1.5" />
                  <p className="text-xs text-zinc-400 font-medium">Food & Dining up 12% from last month.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
