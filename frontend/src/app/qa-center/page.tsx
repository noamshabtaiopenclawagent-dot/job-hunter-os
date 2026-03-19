"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, ListTodo, FileWarning } from "lucide-react";
import { useListBoardsApiV1BoardsGet } from "@/api/generated/boards/boards";
import { useListTasksApiV1BoardsBoardIdTasksGet } from "@/api/generated/tasks/tasks";

// Mock history of recent LLM-as-a-judge decisions
const QA_HISTORY = [
  { id: "qa_101", task: "Implement Quick Task Create", agent: "Bob", verdict: "PASS", score: 92, risk: "Low", time: "10m ago" },
  { id: "qa_102", task: "Resolve caching bugs in Inbox", agent: "Alex", verdict: "FAIL", score: 65, risk: "High", time: "1h ago", fixes: "Missing unit test for Inbox cache invalidation." },
  { id: "qa_103", task: "Update Workboard CSS layout", agent: "CRONX", verdict: "PASS", score: 85, risk: "Medium", time: "3h ago" },
  { id: "qa_104", task: "Setup Docker container", agent: "SENTRY", verdict: "FAIL", score: 40, risk: "Critical", time: "5h ago", fixes: "Port 8000 exposed without auth wrapper. Sent back to SENTRY." },
];

export default function QaCenterPage() {
  const { isSignedIn } = useAuth();
  
  // Fetch real boards to find review tasks
  const boardsQ = useListBoardsApiV1BoardsGet(undefined, { query: { enabled: Boolean(isSignedIn) }});
  const boards = (boardsQ.data?.data as any)?.items || [];
  
  // In a real optimized system, we'd have a global /tasks endpoint.
  // We'll mock the 'Review Queue' since fetching N boards of tasks here is heavy.
  const reviewQueue = [
    { id: "rev_1", title: "Add token history graphs", board: "Mission Control", agent: "Bob", waitTime: "12m" },
    { id: "rev_2", title: "Re-index codebase embeddings", board: "Cerebro", agent: "CRONX", waitTime: "45m" }
  ];

  if (!isSignedIn) {
    return (
      <DashboardShell>
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Sign in to view QA Center.</p>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        <div className="px-6 py-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                Automated QA Center
                <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">LLM-as-a-Judge</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">System-wide automated grading intercepting all tasks prior to human review.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column: Active Queue */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Grading Rubric Config */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <FileWarning size={16} className="text-slate-400" /> Active System Rubric
                </h2>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <span>Code Correctness</span><span className="font-bold text-slate-900">40%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <span>Security & Auth</span><span className="font-bold text-slate-900">30%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <span>Performance</span><span className="font-bold text-slate-900">20%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                    <span>Test Coverage</span><span className="font-bold text-slate-900">10%</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Auto-Reject Threshold:</span>
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-bold">&lt; 80 / 100</span>
                </div>
              </div>

              {/* Live Queue */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ListTodo size={16} className="text-indigo-500" /> Awaiting Auto-QA
                  <span className="ml-auto bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200 text-xs">
                    {reviewQueue.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {reviewQueue.map(t => (
                    <div key={t.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50 flex flex-col gap-2 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" />
                      <p className="text-xs font-semibold text-slate-800 truncate pr-4">{t.title}</p>
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 font-medium">B: {t.board}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-max">{t.agent}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{t.waitTime} Wait</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: History */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h2 className="text-sm font-bold text-slate-800">Recent Grading Decisions</h2>
                   <span className="text-[10px] font-medium text-slate-400">Past 24 Hours</span>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {QA_HISTORY.map(dec => (
                      <div key={dec.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {dec.verdict === "PASS" ? (
                              <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle2 size={16} /></div>
                            ) : (
                              <div className="bg-rose-100 text-rose-600 p-1.5 rounded-full"><XCircle size={16} /></div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none">{dec.task}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{dec.agent}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{dec.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-black tracking-tighter ${dec.score >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {dec.score}<span className="text-xs text-slate-400 font-semibold">/100</span>
                            </span>
                            <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${dec.risk === 'Low' ? 'text-emerald-600' : dec.risk === 'Medium' ? 'text-amber-600' : 'text-rose-600'}`}>
                              {dec.risk} RISK
                            </p>
                          </div>
                        </div>
                        {dec.fixes && (
                          <div className="mt-2 text-xs text-rose-800 bg-rose-50/50 border border-rose-100 rounded p-3 flex gap-2">
                             <AlertTriangle size={14} className="shrink-0 text-rose-500 mt-0.5" />
                             <p><span className="font-bold underline">Rejection Reason:</span> {dec.fixes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
