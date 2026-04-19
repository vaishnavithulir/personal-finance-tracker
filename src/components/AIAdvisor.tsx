"use client";

import { Sparkles, BrainCircuit } from "lucide-react";
import { useState } from "react";

export function AIAdvisor() {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function getAdvice() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/advice", {
        method: "POST",
        body: JSON.stringify({ userId: "demo-user-id" }), // In real app, get from session
      });
      const data = await res.json();
      setAdvice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-8 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center">
            <Sparkles className={`text-primary w-5 h-5 ${loading ? 'animate-spin' : 'animate-pulse'}`} />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">AI Strategy Hub</h3>
        </div>
        
        {advice ? (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-sm text-zinc-300 leading-relaxed">
               "{advice.summary}"
             </div>
             
             <ul className="space-y-3">
               {advice.tips.map((tip: string, i: number) => (
                 <li key={i} className="flex gap-3 text-xs text-zinc-400 font-medium leading-5">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                   {tip}
                 </li>
               ))}
             </ul>

             <div className="pt-4 border-t border-white/5 flex items-center gap-2">
               <Heart className="w-3 h-3 text-red-500 fill-red-500" />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{advice.encouragement}</p>
             </div>

             <button 
               onClick={() => setAdvice(null)}
               className="w-full mt-4 text-[10px] text-zinc-600 font-extrabold uppercase tracking-[0.2em] hover:text-white transition-colors"
             >
               Clear Analysis
             </button>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 text-sm leading-6 mb-8 font-medium">
              Analyze your current spending patterns to identify savings and investment opportunities.
            </p>

            <button 
              disabled={loading}
              onClick={getAdvice}
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-2xl text-sm hover:bg-white/10 transition-all glow-btn"
            >
              {loading ? "Crunching Data..." : "Generate Strategy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  )
}
