"use client";
import React from "react";
import { Lightbulb, TrendingUp, AlertCircle, Sparkles, Activity } from "lucide-react";

/**
 * StrategyInsight: High-level advice from the AI Swarm.
 */
export function StrategyInsight({ title, description, level = "info" }: { title: string, description: string, level?: "info" | "warning" | "success" }) {
  const themes = {
    info: "border-blue-500/10 bg-blue-500/5 text-blue-200",
    warning: "border-amber-500/10 bg-amber-500/5 text-amber-200",
    success: "border-emerald-500/10 bg-emerald-500/5 text-emerald-200",
  };

  return (
    <div className={`p-4 rounded-2xl border ${themes[level]} flex gap-3 items-start animate-slide-up group hover:scale-[1.01] transition-transform`}>
      <div className="mt-0.5">
        {level === "info" && <Lightbulb size={16} className="text-blue-400" />}
        {level === "warning" && <AlertCircle size={16} className="text-amber-400" />}
        {level === "success" && <Sparkles size={16} className="text-emerald-400" />}
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-wider mb-1 opacity-90">{title}</h4>
        <p className="text-[11px] leading-relaxed opacity-60 font-medium">{description}</p>
      </div>
    </div>
  );
}

/**
 * DailyHero: A senior, narrative-driven welcoming section with premium typography.
 */
export function DailyHero({ userName, summary }: { userName: string, summary: string }) {
  const [greeting, setGreeting] = React.useState("Good Day");

  React.useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  return (
    <div className="animate-slide-up mb-10 noise-texture">
      <div className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-2">
        <Sparkles size={10} /> Precision Career Intelligence
      </div>
      <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-none">
        {greeting}, <span className="text-primary italic">{userName}</span>
      </h1>
      <div className="flex items-center gap-4 text-[11px] font-bold text-white/40 uppercase tracking-widest">
        <span className="flex items-center gap-2 text-emerald-400/80"><TrendingUp size={14} /> Swarm Status: Optimal</span>
        <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <span className="text-white/60">{summary}</span>
      </div>
    </div>
  );
}

/**
 * PulseWave: A biometric-style SVG wave for 'System Life'.
 */
export function PulseWave() {
  return (
    <div className="flex items-center gap-1 h-8 w-24 px-3 rounded-full bg-white/5 border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-end gap-0.5 h-4">
        {[0.3, 0.8, 0.4, 0.9, 0.5, 1, 0.6, 0.8, 0.4].map((h, i) => (
          <div 
            key={i} 
            className="w-0.5 bg-primary rounded-full animate-pulse" 
            style={{ 
              height: `${h * 100}%`, 
              animationDelay: `${i * 0.1}s`,
              opacity: 0.3 + (h * 0.7)
            }}
          />
        ))}
      </div>
      <Activity size={12} className="text-primary/60 ml-auto animate-pulse" />
    </div>
  );
}

/**
 * MomentumChart: A sparkline visualization for application velocity.
 */
export function MomentumChart({ data }: { data: number[] }) {
  const width = 120;
  const height = 40;
  const padding = 4;
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - ((d / max) * (height - padding * 2) + padding)
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Momentum</span>
        <span className="text-[10px] font-bold text-emerald-400">+{data[data.length-1]}%</span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="gradient-momentum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsla(var(--primary), 0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke="hsla(var(--primary), 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_hsla(var(--primary),0.5)]"
        />
        <path
          d={`${pathD} L ${points[points.length-1].x},${height} L ${points[0].x},${height} Z`}
          fill="url(#gradient-momentum)"
          className="opacity-20"
        />
        <circle 
          cx={points[points.length-1].x} 
          cy={points[points.length-1].y} 
          r="3" 
          fill="hsla(var(--primary), 1)" 
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

/**
 * InsightCard: Dense data cards for trends.
 */
export function InsightCard({ label, value, subLabel, icon: Icon }: { label: string, value: string, subLabel: string, icon: any }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 group noise-texture">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary/80 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
          <Icon size={20} />
        </div>
        <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">Verified Signal</div>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-white/90 tracking-tighter">{value}</div>
        <div className="text-[10px] font-bold opacity-30 mt-1 italic">{subLabel}</div>
      </div>
    </div>
  );
}
