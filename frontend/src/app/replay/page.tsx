"use client";

import { useState } from "react";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { History, Maximize2, TerminalSquare, AlertCircle, CheckCircle, Database, Search, ArrowRight, Play, FastForward, SkipBack, Cpu } from "lucide-react";

// Mocking a Deep Observability Time-Travel Session
const MOCK_SESSION = {
  taskId: "TSK-8921",
  taskTitle: "Refactor Database Polling Logic",
  agentId: "Bob (Backend Core)",
  duration: "1m 45s",
  totalTokens: "14,502",
  events: [
    { id: 1, type: "prompt", title: "Task Initialized", details: "Received prompt to refactor polling logic in worker.ts", time: "00:00", duration: "2s", status: "success", tokens: 1200 },
    { id: 2, type: "tool", title: "grep_search", details: "Searched for 'setInterval' in backend/src", time: "00:02", duration: "4s", status: "success", tokens: 150 },
    { id: 3, type: "tool", title: "view_file", details: "Read backend/src/workers/polling.ts (140 lines)", time: "00:06", duration: "12s", status: "success", tokens: 4200 },
    { id: 4, type: "reflection", title: "Agent Thought", details: "The current interval is hardcoded to 5s. I should extract this to ENV and switch to an exponential backoff strategy.", time: "00:18", duration: "10s", status: "info", tokens: 800 },
    { id: 5, type: "tool", title: "replace_file_content", details: "Rewrote lines 45-80 with exponential backoff implementation.", time: "00:28", duration: "15s", status: "success", tokens: 3100 },
    { id: 6, type: "tool", title: "run_command", details: "npm run test:workers", time: "00:43", duration: "22s", status: "error", tokens: 300, errorMsg: "Test failed: Backoff limits not respected." },
    { id: 7, type: "reflection", title: "Agent Thought", details: "Ah, the test expects a maximum delay of 30 seconds, but my code allows it to reach 60s. I will clamp the delay.", time: "01:05", duration: "8s", status: "warning", tokens: 1900 },
    { id: 8, type: "tool", title: "replace_file_content", details: "Added Math.min(delay, 30000) inside backoff loop.", time: "01:13", duration: "10s", status: "success", tokens: 1100 },
    { id: 9, type: "tool", title: "run_command", details: "npm run test:workers", time: "01:23", duration: "18s", status: "success", tokens: 450 },
    { id: 10, type: "submit", title: "Task Submitted", details: "Agent marked task as completed.", time: "01:41", duration: "4s", status: "success", tokens: 1302 },
  ]
};

function EventIcon({ type, status }: { type: string, status: string }) {
  if (type === "prompt" || type === "submit") return <CheckCircle className="text-emerald-500" size={18} />;
  if (type === "reflection") return <Cpu className={status === "warning" ? "text-amber-500" : "text-indigo-500"} size={18} />;
  if (status === "error") return <AlertCircle className="text-rose-500" size={18} />;
  if (type === "tool" && (status === "success" || status === "info")) {
    if (status === "info") return <Search className="text-blue-500" size={18} />;
    return <TerminalSquare className="text-slate-500" size={18} />;
  }
  return <Database className="text-slate-400" size={18} />;
}

export default function ReplayPage() {
  const { isSignedIn } = useAuth();
  const [activeEvent, setActiveEvent] = useState(MOCK_SESSION.events[0].id);

  if (!isSignedIn) {
    return (
      <DashboardShell>
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Sign in to view Session Replay.</p>
        </main>
      </DashboardShell>
    );
  }

  const currentEvent = MOCK_SESSION.events.find(e => e.id === activeEvent);

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Time-Travel Session Debugger
                <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider animate-pulse">Live</span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Task: <strong>{MOCK_SESSION.taskId}</strong></span>
                <span>•</span>
                <span>Agent: <strong>{MOCK_SESSION.agentId}</strong></span>
                <span>•</span>
                <span>Tokens: <strong>{MOCK_SESSION.totalTokens}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition"><SkipBack size={16} /></button>
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition"><Play size={16} /></button>
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition"><FastForward size={16} /></button>
          </div>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Timeline Sidebar */}
          <div className="w-1/3 border-r border-slate-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
              Execution Timeline
            </div>
            <div className="p-4 space-y-0">
              {MOCK_SESSION.events.map((ev, i) => {
                const isLast = i === MOCK_SESSION.events.length - 1;
                const isActive = ev.id === activeEvent;
                return (
                  <div 
                    key={ev.id} 
                    className={`relative flex gap-4 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                    onClick={() => setActiveEvent(ev.id)}
                  >
                    {/* timeline line */}
                    {!isLast && <div className={`absolute left-5 top-8 bottom-[-16px] w-[2px] ${isActive ? 'bg-indigo-200' : 'bg-slate-100'}`} />}
                    
                    <div className={`relative z-10 shrink-0 mt-0.5 bg-white rounded-full ${isActive ? 'ring-4 ring-indigo-50' : ''}`}>
                      <EventIcon type={ev.type} status={ev.status} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{ev.title}</span>
                        <span className={`text-[10px] font-mono ${isActive ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>{ev.time}</span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{ev.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Details Pane */}
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
            {currentEvent && (
              <div className="p-8 h-full overflow-y-auto">
                
                <div className="flex items-center gap-3 mb-6">
                  <EventIcon type={currentEvent.type} status={currentEvent.status} />
                  <h2 className="text-xl font-bold text-slate-800">{currentEvent.title}</h2>
                  <span className="ml-auto text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    Latency: {currentEvent.duration}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Action Details</h3>
                  <div className="text-sm font-mono text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {currentEvent.details}
                  </div>
                  
                  {currentEvent.errorMsg && (
                    <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <AlertCircle size={14} /> Execution Error
                      </h4>
                      <code className="text-xs text-rose-600 break-words">{currentEvent.errorMsg}</code>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tokens Consumed</h3>
                     <span className="text-3xl font-black text-indigo-600 tracking-tighter">{currentEvent.tokens}</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center items-center gap-2 relative overflow-hidden group hover:border-slate-300 transition cursor-pointer">
                    <Maximize2 className="text-slate-400 group-hover:text-indigo-500 transition" size={24} />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition">View Raw Context Dump</span>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </DashboardShell>
  );
}
