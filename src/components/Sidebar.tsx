"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  CreditCard, 
  Home, 
  Settings, 
  BrainCircuit,
  LogOut,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Transactions", icon: CreditCard, href: "/transactions" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "AI Advisor", icon: BrainCircuit, href: "/ai-advisor" },
  { name: "Bank Sync", icon: Wallet, href: "/bank-sync" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl h-screen sticky top-0 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center">
          <Wallet className="text-primary w-6 h-6" />
        </div>
        <span className="font-extrabold text-xl tracking-tighter">DUMBO</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
              pathname === item.href 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              pathname === item.href ? "text-primary" : "group-hover:text-white"
            )} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-6">
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl w-full transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
