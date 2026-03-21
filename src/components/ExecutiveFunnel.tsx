"use client";
import React from "react";
import { MetricTile, ProgressRing } from "./EnterpriseUI";
import { Search, FileText, Activity, Target, Trophy } from "lucide-react";

interface Stats {
  discovered: number;
  applied: number;
  interview: number;
  offer: number;
}

export default function ExecutiveFunnel({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/30">
          Conversion Intelligence
        </h3>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
             LIVE PULSE
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricTile label="Discovered" value={stats.discovered} icon={Search} trend={12} />
        <MetricTile label="Applications" value={stats.applied} icon={FileText} trend={5} />
        <MetricTile label="Interviews" value={stats.interview} icon={Activity} trend={2} />
        <MetricTile label="Offers" value={stats.offer} icon={Trophy} />
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-around">
         <div className="text-center space-y-2">
            <ProgressRing score={Math.round((stats.applied / (stats.discovered || 1)) * 100)} size={60} />
            <div className="text-[9px] font-bold uppercase opacity-40">Apply Rate</div>
         </div>
         <div className="h-10 w-px bg-white/5" />
         <div className="text-center space-y-2">
            <ProgressRing score={Math.round((stats.interview / (stats.applied || 1)) * 100)} size={60} />
            <div className="text-[9px] font-bold uppercase opacity-40">Interview ROI</div>
         </div>
         <div className="h-10 w-px bg-white/5" />
         <div className="text-center space-y-2">
            <ProgressRing score={Math.round((stats.offer / (stats.interview || 1)) * 100)} size={60} />
            <div className="text-[9px] font-bold uppercase opacity-40">Closure</div>
         </div>
      </div>
    </div>
  );
}
