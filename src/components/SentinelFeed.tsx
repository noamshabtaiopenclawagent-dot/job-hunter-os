"use client";
import React from "react";
import { Shield, Cpu, History, Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  msg: string;
  time: string;
  type: "info" | "success" | "warning";
}

export default function SentinelFeed({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl h-full flex flex-col animate-slide-in relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          Autonomous Audit
        </h3>
        <div className="flex items-center gap-2">
          <span className="status-pulse"></span>
        </div>
      </div>

      <div className="flex-1 font-mono text-[10px] overflow-y-auto space-y-4 pr-3 custom-scrollbar relative z-10">
        {logs.map((log) => (
          <div key={log.id} className="group">
            <div className="flex gap-3 items-start mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
               <span className="w-10 whitespace-nowrap">{log.time}</span>
               <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                  log.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  log.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                  'bg-blue-500/20 text-blue-400'
               }`}>
                  {log.type}
               </span>
            </div>
            <p className={`pl-[52px] leading-relaxed ${
               log.type === 'success' ? 'text-emerald-50/70' : 
               log.type === 'warning' ? 'text-amber-50/70' : 
               'text-white/60'
            }`}>
              {log.msg}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-10">
            <Cpu size={32} />
            <p className="text-[10px] uppercase font-black tracking-widest">Monitoring Signal Grid</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 relative z-10">
         <div className="flex justify-between items-center text-[10px] font-bold text-white/30 italic">
            <span className="flex items-center gap-1.5"><Shield size={12}/> ENCRYPT_SSL_V3</span>
            <span>Uptime: 100%</span>
         </div>
         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-primary/40 rounded-full animate-pulse" />
         </div>
      </div>
    </div>
  );
}
