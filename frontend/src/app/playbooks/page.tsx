"use client";

import { useState } from "react";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { PlaySquare, CheckCircle2, ChevronRight, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAYBOOKS = [
  {
    id: "audit",
    title: "Full Code Audit",
    desc: "Sequential execution of security scans, linting borders, and dependency checks.",
    agents: ["SENTRY", "Bob"],
    impact: "High",
  },
  {
    id: "deploy",
    title: "Deploy Production Release",
    desc: "Create build, launch E2E suite, and cut release branch.",
    agents: ["Alex", "Bob"],
    impact: "Critical",
  },
  {
    id: "onboard",
    title: "New Employee Onboarding",
    desc: "Provision accounts, send intro emails, and verify setup.",
    agents: ["CRONX"],
    impact: "Low",
  }
];

export default function PlaybooksPage() {
  const { isSignedIn } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);

  const handleLaunch = async (id: string) => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/playbooks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbookId: id })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.tasks);
      }
    } catch(e) { console.error(e); }
    finally { setRunning(false); }
  };

  if (!isSignedIn) {
    return (
      <DashboardShell>
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Sign in to view Playbooks.</p>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        <div className="px-6 py-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <PlaySquare size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Automated Playbooks</h1>
              <p className="text-xs text-slate-500">1-click task generation workflows for standard operations.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Playbooks List */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-500 mb-2">Available Playbooks</h2>
              {PLAYBOOKS.map(pb => (
                <button 
                  key={pb.id}
                  onClick={() => { setSelectedId(pb.id); setResult(null); }}
                  className={`w-full text-left bg-white border rounded-xl p-5 shadow-sm transition-all flex flex-col gap-2 ${selectedId === pb.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-900">{pb.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${pb.impact === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{pb.impact} IMPACT</span>
                  </div>
                  <p className="text-xs text-slate-500">{pb.desc}</p>
                  <div className="mt-2 flex gap-1 items-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Actors:</span>
                    {pb.agents.map(a => <span key={a} className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 rounded">{a}</span>)}
                  </div>
                </button>
              ))}
            </div>

            {/* Execution Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col">
              {selectedId ? (
                <>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Execution Plan</h2>
                    <p className="text-sm text-slate-500 mb-6">Launching this playbook will automatically generate dependent tasks and assign them to the relevant agents based on the SOP.</p>
                    
                    {result ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <CheckCircle2 size={18} />
                          <span>Playbook Dispatched!</span>
                        </div>
                        <ul className="space-y-2">
                          {result.map(t => (
                            <li key={t.id} className="text-xs flex items-center gap-2 bg-white px-3 py-2 border rounded shadow-sm">
                              <span className="font-mono text-slate-400">{t.id}</span>
                              <span className="font-semibold text-slate-800 flex-1">{t.title}</span>
                              <span className="bg-slate-100 px-1.5 rounded text-[10px] font-bold text-slate-600 border">{t.agent}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                       <p className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">Preview sequence:</p>
                       <ul className="space-y-3">
                         <li className="flex gap-2 items-center text-sm font-medium text-slate-700"><ChevronRight size={14} className="text-indigo-400"/> Task generation</li>
                         <li className="flex gap-2 items-center text-sm font-medium text-slate-700"><ChevronRight size={14} className="text-indigo-400"/> Agent assignment</li>
                         <li className="flex gap-2 items-center text-sm font-medium text-slate-700"><ChevronRight size={14} className="text-indigo-400"/> Status set to INBOX</li>
                       </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Button 
                      onClick={() => handleLaunch(selectedId)} 
                      disabled={running}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 flex gap-2 items-center justify-center text-base"
                    >
                      {running ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                      {running ? "Executing Playbook..." : "Launch Playbook"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                  <PlaySquare size={48} className="opacity-20 mb-4" />
                  <p className="font-medium text-slate-600">Select a Playbook</p>
                  <p className="text-sm mx-8 mt-2">Choose an automated workflow from the left to view its execution plan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
