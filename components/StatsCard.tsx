"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  type?: 'success' | 'danger' | 'primary';
}

export function StatsCard({ label, value, icon: Icon, trend, type = 'primary' }: StatsCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <div className="glass-card p-6 flex items-center gap-5 group hover:border-white/20 transition-all cursor-pointer">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 
        ${type === 'success' ? 'group-hover:bg-success/20 group-hover:border-success/50' : 
          type === 'danger' ? 'group-hover:bg-danger/20 group-hover:border-danger/50' : 
          'group-hover:bg-primary/20 group-hover:border-primary/50'}`}>
        <Icon className={`w-6 h-6 ${type === 'success' ? 'text-success' : type === 'danger' ? 'text-danger' : 'text-primary'}`} />
      </div>
      
      <div>
        <p className="text-zinc-500 text-sm font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-end gap-3">
          <h2 className="text-3xl font-extrabold tracking-tight">{value}</h2>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold mb-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
