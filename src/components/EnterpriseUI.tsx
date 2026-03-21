"use client";
import React from "react";
import { CheckCircle, XCircle, Clock, Activity, Target, Zap, Search, FileText } from "lucide-react";

/**
 * StatusBadge: A high-fidelity, icon-driven label for job pipeline states.
 */
export function StatusBadge({ status }: { status: string }) {
  const cfg: any = {
    applied: { icon: <Clock size={12}/>, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    interview: { icon: <Activity size={12}/>, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    rejected: { icon: <XCircle size={12}/>, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    offer: { icon: <CheckCircle size={12}/>, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    new: { icon: <Zap size={12}/>, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  };

  const c = cfg[status.toLowerCase()] || cfg.new;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-tight ${c.bg} ${c.color} ${c.border}`}>
      {c.icon}
      {status}
    </div>
  );
}

/**
 * ProgressRing: An SVG-based professional score visualization with comparison support.
 */
export function ProgressRing({ score, target, size = 44 }: { score: number, target?: number, size?: number }) {
  const radius = size * 0.42;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center group">
      <svg height={size} width={size} className="transform -rotate-90 overflow-visible">
        {/* Shadow Ring */}
        <circle
          stroke="hsla(var(--foreground), 0.03)"
          fill="transparent"
          strokeWidth={stroke * 1.5}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Track */}
        <circle
          stroke="hsla(var(--foreground), 0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Target Marker (Optional) */}
        {target !== undefined && (
           <circle
             stroke="hsla(var(--primary), 0.2)"
             fill="transparent"
             strokeWidth={stroke}
             strokeDasharray={`${circumference * (target/100)} 1000`}
             r={normalizedRadius}
             cx={size / 2}
             cy={size / 2}
             className="transition-all duration-1000"
           />
        )}
        {/* Progress */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: offset }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_hsla(var(--primary),0.4)]"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[11px] font-black leading-none">{score}</span>
        <span className="text-[7px] font-bold opacity-20 uppercase tracking-tighter">Match</span>
      </div>
    </div>
  );
}

/**
 * MetricTile: Essential conversion metrics with tactile hover and internal glow.
 */
export function MetricTile({ label, value, icon: Icon, trend }: { label: string, value: number, icon: any, trend?: number }) {
  return (
    <div className="glass-card p-5 rounded-2xl flex items-center justify-between group relative overflow-hidden noise-texture">
      {/* Internal Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
          <Icon size={20} />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase opacity-20 tracking-wider mb-0.5">{label}</div>
          <div className="text-2xl font-black tracking-tight">{value}</div>
        </div>
      </div>
      
      {trend !== undefined && (
        <div className={`relative z-10 px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter ${trend >= 0 ? 'text-emerald-400 bg-emerald-400/5' : 'text-red-400 bg-red-400/5'}`}>
          {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
