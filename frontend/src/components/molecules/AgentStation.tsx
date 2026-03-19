"use client";

import type { AgentRead, TaskRead } from "@/api/generated/model";
import type { OrgTreeNode } from "@/lib/org-tree";
import { Send } from "lucide-react";
import { useState } from "react";

export type AgentWorkState = "working" | "reviewing" | "idle" | "offline" | "blocked";

function deriveState(agent?: AgentRead | null, activeTask?: TaskRead | null): AgentWorkState {
  if (!agent || (agent.status ?? "").toLowerCase() !== "online") return "offline";
  if (!activeTask) return "idle";
  const title = activeTask.title ?? "";
  if (title.startsWith("[CODE-REVIEW]") || title.startsWith("[REVIEW]")) return "reviewing";
  if (activeTask.status === "in_progress") return "working";
  return "idle";
}

const STATE_CONFIG: Record<
  AgentWorkState,
  { screenGlow: string; badge: string; badgeText: string; icon: string; pulse: boolean; stationRing: string }
> = {
  working:   { screenGlow: "shadow-blue-400/60",   badge: "bg-blue-500",    badgeText: "Working",   icon: "⌨️", pulse: true,  stationRing: "ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" },
  reviewing: { screenGlow: "shadow-amber-400/60",  badge: "bg-amber-500",   badgeText: "Reviewing", icon: "🔍", pulse: true,  stationRing: "ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" },
  idle:      { screenGlow: "shadow-slate-200/40",  badge: "bg-slate-400",   badgeText: "Idle",      icon: "💤", pulse: false, stationRing: "ring-2 ring-emerald-200 animate-[pulse_3s_ease-in-out_infinite]" },
  offline:   { screenGlow: "shadow-slate-100/20",  badge: "bg-slate-300",   badgeText: "Offline",   icon: "⚫", pulse: false, stationRing: "ring-2 ring-rose-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_20px_rgba(244,63,94,0.6)]" },
  blocked:   { screenGlow: "shadow-red-400/50",    badge: "bg-red-500",     badgeText: "Blocked",   icon: "⚠️", pulse: true,  stationRing: "ring-2 ring-amber-500 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_20px_rgba(245,158,11,0.5)]" },
};

export function AgentStation({
  node,
  agent,
  activeTask,
}: {
  node: OrgTreeNode;
  agent?: AgentRead | null;
  activeTask?: TaskRead | null;
}) {
  const state = deriveState(agent, activeTask);
  const cfg = STATE_CONFIG[state];
  const isActive = state === "working" || state === "reviewing";
  const taskLabel = activeTask?.title
    ? activeTask.title.replace(/^\[[\w-]+\]\s*/, "").slice(0, 45) +
      (activeTask.title.length > 45 ? "…" : "")
    : null;

  const [steerCmd, setSteerCmd] = useState("");
  const [injecting, setInjecting] = useState(false);

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!steerCmd.trim()) return;
    setInjecting(true);
    // Simulate API injection delay
    setTimeout(() => {
      setSteerCmd("");
      setInjecting(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-2 group select-none">
      {/* Workstation */}
      <div
        className={`relative rounded-2xl p-4 transition-all duration-500 ${cfg.stationRing}
          ${isActive ? "bg-white" : "bg-slate-50"}
          shadow-lg flex-shrink-0
        `}
        style={{ width: 180, minHeight: 160 }}
      >
        {/* Monitor screen */}
        <div
          className={`relative mx-auto rounded-lg border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-700
            ${isActive
              ? "border-blue-300 bg-gradient-to-br from-slate-900 to-slate-800"
              : "border-slate-200 bg-slate-100"
            }
          `}
          style={{ width: 120, height: 80 }}
        >
          {/* Screen glow overlay */}
          {isActive && (
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-400 to-blue-600 animate-pulse" />
          )}

          {/* Code lines animation */}
          {state === "working" && (
            <div className="absolute inset-0 flex flex-col justify-center px-2 gap-1 opacity-70">
              {[60, 40, 80, 30, 55, 45].map((w, i) => (
                <div
                  key={i}
                  className="rounded-full bg-green-400 h-1"
                  style={{
                    width: `${w}%`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.6 + (i % 2) * 0.4,
                    transition: "width 1s ease-in-out",
                  }}
                />
              ))}
              {/* blinking cursor */}
              <div className="absolute bottom-2 right-3 w-1.5 h-3 bg-green-400 animate-[blink_1s_step-end_infinite] rounded-sm" />
            </div>
          )}

          {/* Review state */}
          {state === "reviewing" && (
            <div className="relative z-10 text-2xl animate-bounce">🔎</div>
          )}

          {/* Idle / offline state */}
          {(state === "idle" || state === "offline") && (
            <span className="text-2xl opacity-50">{node.emoji}</span>
          )}
        </div>

        {/* Monitor stand */}
        <div className="mx-auto mt-1 w-8 h-2 bg-slate-300 rounded-sm" />
        <div className="mx-auto w-12 h-1 bg-slate-300 rounded-sm" />

        {/* Keyboard */}
        <div
          className={`mx-auto mt-2 rounded border flex items-center justify-center transition-all
            ${isActive ? "border-slate-300 bg-slate-200 animate-[keyboard_0.8s_ease-in-out_infinite]" : "border-slate-200 bg-slate-100"}
          `}
          style={{ width: 100, height: 18 }}
        >
          {isActive && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((k) => (
                <div
                  key={k}
                  className="w-2.5 h-2 rounded-sm bg-slate-400 opacity-70"
                  style={{ animationDelay: `${k * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* State badge */}
        <div className="absolute -top-2 -right-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide shadow ${cfg.badge}`}
          >
            {cfg.pulse && (
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
            {cfg.badgeText}
          </span>
        </div>
      </div>

      {/* Name tag */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg">{node.emoji}</span>
        <span className="font-bold text-slate-800 text-sm tracking-wide">{node.name}</span>
        <span className="text-[10px] text-slate-500">{node.role}</span>
      </div>

      {/* Speech bubble: current task */}
      {taskLabel && (
        <div className="flex flex-col gap-1 items-center w-full mt-1">
          <div
            className="max-w-[180px] rounded-xl rounded-bl-none border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] text-blue-800 shadow-sm leading-snug text-center"
          >
            {taskLabel}
          </div>
          
          {/* Thread Hijack / Steer Control */}
          {isActive && (
            <form onSubmit={handleInject} className="relative w-[160px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <input 
                 type="text"
                 value={steerCmd}
                 onChange={e => setSteerCmd(e.target.value)}
                 disabled={injecting}
                 placeholder="Steer agent..."
                 className="w-full bg-white border border-slate-300 rounded-full py-1 pl-3 pr-7 text-[10px] text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm disabled:opacity-50"
               />
               <button 
                 type="submit" 
                 disabled={injecting || !steerCmd.trim()}
                 className="absolute right-1 top-[3px] p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-50"
                 title="Inject Prompt into active thread"
               >
                 <Send size={10} />
               </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
