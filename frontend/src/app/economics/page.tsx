"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { Coins, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type EconData = {
  currentBurnRate: string;
  projectedMonthly: string;
  agents: Array<{ agentId: string; name: string; role: string; dailyTokens: number; cost: number }>;
  history: Array<{ date: string; Bob: number; Opi: number }>;
};

export default function EconomicsPage() {
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<EconData | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/economics").then(r => r.json()).then(setData);
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <DashboardShell>
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Sign in to view Economics.</p>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        <div className="px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Coins size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Economics & Tokens</h1>
              <p className="text-xs text-slate-500">Real-time AI compute spend across the 2-agent runtime.</p>
            </div>
          </div>

          {!data ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Daily Burn</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{data.currentBurnRate}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected Monthly</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{data.projectedMonthly}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1"><AlertCircle size={14}/> Top Spender</p>
                    <p className="text-xl font-bold text-red-900 mt-2">Bob (Dev)</p>
                  </div>
                  <p className="text-sm font-medium text-red-700">$8.50 today (850k tokens)</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-slate-400" size={18} />
                  <h2 className="font-semibold text-slate-800">Token Cost History (USD)</h2>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                      <Bar dataKey="Bob" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Opi" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-sm font-semibold text-slate-800">Agent Spend Breakdown</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {data.agents.sort((a,b) => b.cost - a.cost).map(agent => (
                    <div key={agent.agentId} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">${agent.cost.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 font-mono">{agent.dailyTokens.toLocaleString()} tkns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
