"use client";
export const dynamic = "force-dynamic";

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Virtual Office — Phase 24 Clean Rewrite                           ║
// ║  8 self-contained components. No magic numbers. Always looks alive. ║
// ╚══════════════════════════════════════════════════════════════════════╝

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth, SignedIn, SignedOut } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { LogViewer } from "@/components/organisms/LogViewer";
import { ApiError } from "@/api/mutator";
import {
  type listAgentsApiV1AgentsGetResponse,
  useListAgentsApiV1AgentsGet,
} from "@/api/generated/agents/agents";
import { useListTasksApiV1BoardsBoardIdTasksGet } from "@/api/generated/tasks/tasks";
import { ORG_TREE, flattenTree, SWARM_LINKS } from "@/lib/org-tree";
import { sx, sy, pt, TIER_COLOR } from "@/lib/iso-engine";
import type { AgentRead } from "@/api/generated/model";

// ─── State type ──────────────────────────────────────────────────────────────
type State = "working" | "reviewing" | "idle" | "offline";

// ─── Layout constants ────────────────────────────────────────────────────────
const COLS    = 20;    // grid columns
const ROWS    = 20;    // grid rows
const CX      = 10;    // center col
const CY      = 10;    // center row
const DESK_H  = 22;    // desk box screen height (px)
const MON_H   = 46;    // monitor screen height (px)
const STAND_H = 8;     // monitor stand height (px)

// ─── 1. IsoBox — primitive 3D box ────────────────────────────────────────────
function IsoBox({
  c, r, w = 1, d = 1, h,
  top, left, right, opacity = 1,
}: {
  c: number; r: number; w?: number; d?: number; h: number;
  top: string; left: string; right: string; opacity?: number;
}) {
  const T = [
    pt(sx(c,   r),   sy(c,   r)),
    pt(sx(c+w, r),   sy(c+w, r)),
    pt(sx(c+w, r+d), sy(c+w, r+d)),
    pt(sx(c,   r+d), sy(c,   r+d)),
  ].join(" ");
  const L = [
    pt(sx(c, r),   sy(c, r)),
    pt(sx(c, r+d), sy(c, r+d)),
    pt(sx(c, r+d), sy(c, r+d) + h),
    pt(sx(c, r),   sy(c, r)   + h),
  ].join(" ");
  const R = [
    pt(sx(c,   r+d), sy(c,   r+d)),
    pt(sx(c+w, r+d), sy(c+w, r+d)),
    pt(sx(c+w, r+d), sy(c+w, r+d) + h),
    pt(sx(c,   r+d), sy(c,   r+d) + h),
  ].join(" ");
  return (
    <g opacity={opacity}>
      <polygon points={T} fill={top}   stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <polygon points={L} fill={left}  stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
      <polygon points={R} fill={right} stroke="rgba(0,0,0,0.15)" strokeWidth={0.3} />
    </g>
  );
}

// ─── 2. Floor — 20×20 alternating tile grid ──────────────────────────────────
function Floor() {
  const tiles = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const even = (c + r) % 2 === 0;
      tiles.push(
        <IsoBox
          key={`${c}-${r}`} c={c} r={r} w={0.98} d={0.98} h={4}
          top={even ? "#111827" : "#0d1520"}
          left="#08111e" right="#060c16"
        />
      );
    }
  }
  return <g>{tiles}</g>;
}

// ─── 3. Monitor (Advanced Curved Panels) ────────────────────────────────────
function Monitor({ c, r, state }: { c: number; r: number; state: State }) {
  const screenColor =
    state === "working"   ? "#10b981" :
    state === "reviewing" ? "#f59e0b" :
    state === "idle"      ? "#0ea5e9" :
    "#0a1420";

  const LIFT = DESK_H + STAND_H;
  const sc = c + 0.05, sr = r + 0.05;

  const MC = c - 0.2, MR = r - 0.02, MW = 0.9, MD = 0.06;
  const BOT  = sy(MC, MR + MD) - DESK_H;
  const SX_BL = sx(MC, MR + MD), SX_BR = sx(MC + MW, MR + MD);
  
  // Curved path for the monitor top/bottom
  const screenFront = [
    `M ${SX_BL} ${BOT}`,
    `Q ${ (SX_BL+SX_BR)/2 } ${BOT+3} ${SX_BR} ${sy(MC+MW, MR+MD)-DESK_H}`,
    `L ${SX_BR} ${sy(MC+MW, MR+MD)-DESK_H-MON_H}`,
    `Q ${ (SX_BL+SX_BR)/2 } ${BOT-MON_H+3} ${SX_BL} ${BOT-MON_H}`,
    `Z`
  ].join(" ");

  const midX = (SX_BL + SX_BR) / 2;
  const midY = BOT - MON_H / 2;

  return (
    <g>
      {/* Curved Screen body */}
      <path d={screenFront} fill="#111827" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
      <path d={screenFront} fill={screenColor} opacity={0.15} filter="url(#glow)" />
      
      {/* Screen glow on floor */}
      {state !== "offline" && (
        <ellipse cx={midX} cy={BOT + 15} rx={32} ry={10}
          fill={screenColor} opacity={0.15} filter="url(#softBlur)">
          <animate attributeName="opacity" values="0.05;0.22;0.05" dur="3s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Glare stripe */}
      <path
        d={`M ${SX_BL+4} ${BOT-3} L ${SX_BR-8} ${BOT-MON_H+8} L ${SX_BR-16} ${BOT-MON_H+4} L ${SX_BL+8} ${BOT} Z`}
        fill="white" opacity={0.07} />

      {/* Scrolling terminal lines when active */}
      {(state === "working" || state === "reviewing") && (
        <g opacity={0.65}>
          <defs>
            <clipPath id={`mc-${Math.round(c*10)}-${Math.round(r*10)}`}>
              <polygon points={screenFront} />
            </clipPath>
          </defs>
          <g clipPath={`url(#mc-${Math.round(c*10)}-${Math.round(r*10)})`}>
            <animateTransform attributeName="transform" type="translate"
              from="0 14" to="0 -14" dur="4s" repeatCount="indefinite" />
            {[0,1,2,3,4,5].map(i => (
              <line key={i}
                x1={midX - 12} y1={midY - 12 + i * 8}
                x2={midX - 12 + [20,13,22,9,16,18][i]} y2={midY - 12 + i * 8}
                stroke={state === "reviewing" ? "#3a1500" : "#003a18"} strokeWidth={2.5} />
            ))}
          </g>
        </g>
      )}
    </g>
  );
}

// ─── 4. Chair (Ergonomic Command Seat) ───────────────────────────────────────
function Chair({ c, r, color, senior }: {
  c: number; r: number; color: string; senior: boolean;
}) {
  return (
    <g>
      {/* Chair Aura (Backlight) */}
      <ellipse cx={sx(c+1.05, r+1.6)} cy={sy(c+1.05, r+1.6)-30} rx={20} ry={35} fill={color} opacity={0.1} filter="url(#softBlur)" />
      
      {/* Hydraulic Base */}
      <IsoBox c={c+0.95} r={r+1.9} w={0.2} d={0.2} h={4} top="#334155" left="#1e293b" right="#0f172a" />
      
      {/* Seat cushion */}
      <IsoBox c={c+0.6} r={r+1.6} w={0.9} d={0.7} h={5}  top="#0f172a" left="#020617" right="#020617" />
      
      {/* Backrest (Curved shell) */}
      <path
        d={`M ${sx(c+0.6, r+1.6)} ${sy(c+0.6, r+1.6)-10}
            Q ${sx(c+1.05, r+1.6)} ${sy(c+1.05, r+1.6)-55}
            ${sx(c+1.5, r+1.6)} ${sy(c+1.5, r+1.6)-10}`}
        fill="none"
        stroke={senior ? color : "#1e293b"}
        strokeWidth={senior ? 14 : 9}
        strokeLinecap="round" />
        
      {/* Headrest detail */}
      <rect x={sx(c+1.05, r+1.6)-8} y={sy(c+1.05, r+1.6)-52} width={16} height={6} rx={3} fill={senior ? color : "#475569"} opacity={0.8} />
    </g>
  );
}

// ─── 5. Desk surface + carpet ─────────────────────────────────────────────────
function Desk({ c, r, state }: { c: number; r: number; state: State }) {
  const carpet =
    state === "working"   ? "#071f10" :
    state === "reviewing" ? "#1a0e00" :
    state === "idle"      ? "#09111e" :
    "#060d18";

  return (
    <g>
      {/* 3×3 carpet with micro-bevel */}
      {[0,1,2].flatMap(dc => [0,1,2].map(dr => (
        <IsoBox key={`${dc}${dr}`}
          c={c+dc} r={r+dr} w={0.96} d={0.96} h={3}
          top={carpet} left="#050812" right="#03060c" />
      )))}

      {/* Grounding Shadow / Glow */}
      <ellipse cx={sx(c+1.5, r+1.5)} cy={sy(c+1.5, r+1.5)+2} rx={60} ry={25}
        fill={state === "working" ? "#10b981" : state === "reviewing" ? "#f59e0b" : "#0ea5e9"} 
        opacity={0.08} filter="url(#softBlur)">
        <animate attributeName="opacity" values="0.04;0.1;0.04" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* Desk body with internal detail */}
      <IsoBox c={c+0.15} r={r+0.15} w={2.1} d={1.1} h={DESK_H-4}
        top="#020819" left="#020819" right="#020208" />
      
      {/* Carbon-fiber style surface with reflections */}
      <IsoBox c={c+0.10} r={r+0.10} w={2.2} d={1.2} h={4}
        top="#0f172a" left="#1a2540" right="#152035" />
      
      {/* Surface reflections */}
      <line x1={sx(c+0.2, r+0.2)} y1={sy(c+0.2, r+0.2)-DESK_H} x2={sx(c+2.0, r+1.0)} y2={sy(c+2.0, r+1.0)-DESK_H} stroke="white" strokeWidth={0.5} opacity={0.05} />

      {/* Keyboard glow */}
      {state === "working" && (
        <rect
          x={sx(c+0.7, r+0.7)} y={sy(c+0.7, r+0.7) - DESK_H - 1}
          width={28} height={10} rx={1}
          fill="#38bdf8" opacity={0.1} filter="url(#glow)" >
          <animate attributeName="opacity" values="0.05;0.15;0.05" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
}

// ─── 6. AgentFigure ──────────────────────────────────────────────────────────
// ─── 6. AgentFigure (Hyper-Detailed Evolution) ──────────────────────────────
function AgentFigure({ c, r, color, state, role }: {
  c: number; r: number; color: string; state: State; role: string;
}) {
  const cx   = sx(c, r);
  const cy   = sy(c, r) - 4;    
  const SY   = cy - 14;         
  const roleLower = role.toLowerCase();

  const getRoleOverlay = (x: number, y: number, isHead: boolean) => {
    if (roleLower.includes("security") || roleLower.includes("sentry")) {
      return isHead ? (
        <g>
          <rect x={x-10} y={y-3} width={20} height={3} rx={1} fill="#ef4444" filter="url(#glow)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <animateTransform attributeName="transform" type="rotate" values="-15;15;-15" dur="4s" repeatCount="indefinite" cx={x} cy={y} />
        </g>
      ) : (
        <g>
           {/* Heavy Shoulder Pads */}
           <rect x={x-14} y={y-4} width={8} height={6} rx={2} fill="url(#plateGrad)" opacity={0.8} />
           <rect x={x+6} y={y-4} width={8} height={6} rx={2} fill="url(#plateGrad)" opacity={0.8} />
        </g>
      );
    }
    if (roleLower.includes("research") || roleLower.includes("rex")) {
      return isHead ? (
        <g transform={`translate(${x+5}, ${y-2})`}>
          <circle r={5} fill="none" stroke="#22d3ee" strokeWidth={1} filter="url(#glow)">
             <animate attributeName="r" values="4;6.5;4" dur="3s" repeatCount="indefinite" />
          </circle>
          <line x1={0} y1={0} x2={6} y2={-4} stroke="#22d3ee" strokeWidth={0.5} />
        </g>
      ) : null;
    }
    if (roleLower.includes("dev") || roleLower.includes("builder") || roleLower.includes("bob") || roleLower.includes("qa")) {
      return !isHead ? (
        <g>
          <rect x={x-12} y={y+10} width={24} height={4} fill="#1e293b" rx={1} />
          <path d={`M ${x-8} ${y+10} L ${x-6} ${y+12} L ${x-8} ${y+14}`} stroke="#94a3b8" strokeWidth={1.5} fill="none" />
        </g>
      ) : null;
    }
    if (roleLower.includes("manager") || roleLower.includes("scrum") || roleLower.includes("mico")) {
      return isHead ? (
        <path d={`M ${x-7} ${y-16} L ${x} ${y-24} L ${x+7} ${y-16}`} stroke="#fbbf24" strokeWidth={2} fill="none" opacity={0.7} filter="url(#glow)">
           <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
        </path>
      ) : null;
    }
    return null;
  };

  const renderBody = (x: number, y: number, w: number, h: number, fill: string) => (
    <g>
       {/* Modular Plate Architecture (Split Torso) */}
       <rect x={x} y={y} width={w} height={h*0.4} rx={3} fill={fill} />
       <rect x={x} y={y + h*0.5} width={w} height={h*0.45} rx={3} fill={fill} />
       {/* Internal Core Glow */}
       <rect x={x+w*0.2} y={y+h*0.35} width={w*0.6} height={h*0.15} fill={fill} opacity={0.4} filter="url(#glow)" />
    </g>
  );

  if (state === "offline") {
    return (
      <g opacity={0.5}>
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="5s" repeatCount="indefinite" />
        <g transform={`translate(${cx}, ${cy})`}>
          <path d="M -6 -10 L -11 3"  stroke="#334155" strokeWidth={6} strokeLinecap="round" />
          <path d="M  6 -10 L  11 3"  stroke="#334155" strokeWidth={6} strokeLinecap="round" />
          {renderBody(-11, -36, 22, 26, "#1e293b")}
          <circle cy={-52} r={13} fill="#1e293b" />
          {getRoleOverlay(0, -52, true)}
        </g>
      </g>
    );
  }

  const agentFill = `url(#grad-${color.replace("#","")})`;

  if (state === "idle") {
    const ox = cx + 10;
    return (
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`0 0; 0 -4; 0 0`} dur="3.5s" repeatCount="indefinite" />
        <ellipse cx={ox} cy={cy} rx={11} ry={4} fill="rgba(0,0,0,0.5)" />
        <line x1={ox-5} y1={cy-28} x2={ox-5} y2={cy} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        <line x1={ox+5} y1={cy-28} x2={ox+5} y2={cy} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        {renderBody(ox-11, cy-56, 22, 28, agentFill)}
        {getRoleOverlay(ox, cy-56, false)}
        <path d={`M ${ox-10} ${cy-50} L ${ox-4} ${cy-36}`} stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        <path d={`M ${ox+10} ${cy-50} L ${ox+4} ${cy-36}`} stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        <rect x={ox-5} y={cy-38} width={10} height={8} rx={1} fill="#22d3ee" filter="url(#glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </rect>
        <circle cx={ox} cy={cy-72} r={14} fill={agentFill} />
        {getRoleOverlay(ox, cy-72, true)}
        {/* Holographic Eyes */}
        <rect x={ox-8} y={cy-74} width={4} height={2} rx={1} fill="rgba(255,255,255,0.6)" />
        <rect x={ox+4} y={cy-74} width={4} height={2} rx={1} fill="rgba(255,255,255,0.6)" />
      </g>
    );
  }

  // seated
  return (
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="0 0; 0 -2.5; 0 0" dur="4s" repeatCount="indefinite" />
      <ellipse cx={cx} cy={cy} rx={12} ry={4} fill="rgba(0,0,0,0.5)" />
      <path d={`M ${cx-7} ${SY} L ${cx-11} ${cy}`} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      <path d={`M ${cx+7} ${SY} L ${cx+11} ${cy}`} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      {renderBody(cx-11, SY-28, 22, 28, agentFill)}
      {getRoleOverlay(cx, SY-28, false)}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values="-3;3;-3" dur="0.18s" repeatCount="indefinite" cx={cx} cy={SY-18} />
        <path d={`M ${cx-9} ${SY-20} L ${cx-24} ${SY-6}`} stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        <path d={`M ${cx+9} ${SY-20} L ${cx+24} ${SY-6}`} stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      </g>
      <circle cx={cx} cy={SY-46} r={14} fill={agentFill} />
      {getRoleOverlay(cx, SY-46, true)}
      {/* Holographic Eyes */}
      <rect x={cx-7} y={SY-48} width={4} height={2} rx={1} fill="rgba(255,255,255,0.6)" />
      <rect x={cx+3} y={SY-48} width={4} height={2} rx={1} fill="rgba(255,255,255,0.6)" />
    </g>
  );
}

// ─── 7. AgentPanel — floating name/status badge ───────────────────────────────
function AgentPanel({ c, r, name, role, state, tier }: {
  c: number; r: number; name: string; role: string; state: State; tier: string;
}) {
  const px = sx(c + 1, r + 1);
  const py = sy(c + 1, r + 1) - DESK_H - MON_H - 16;
  const glowColor =
    state === "working"   ? "#10b981" :
    state === "reviewing" ? "#f59e0b" :
    "#38bdf8";

  if (state === "offline") {
    // Minimal offline tag
    return (
      <text x={px} y={py} textAnchor="middle"
        fill="#334155" fontSize={6} fontFamily="monospace" opacity={0.6}>
        // OFFLINE
      </text>
    );
  }

  return (
    <g transform={`translate(${px}, ${py})`}>
      <rect x={-44} y={-26} width={88} height={34} rx={4}
        fill="rgba(2,6,23,0.92)" stroke={glowColor} strokeWidth={0.8} />
      <path d="M -4 8 L 0 14 L 4 8 Z"
        fill="rgba(2,6,23,0.92)" stroke={glowColor} strokeWidth={0.8} />
      <text x={-38} y={-13} fill="white" fontSize={8} fontWeight="900" fontFamily="monospace">
        {name.toUpperCase()}
      </text>
      <text x={-38} y={-3} fill="#64748b" fontSize={5.5} fontFamily="monospace">
        {role.slice(0, 18).toUpperCase()}
      </text>
      <circle cx={38} cy={-19} r={2.5} fill={glowColor}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ─── 8. AgentStation — complete workstation unit (Command Pod Overhaul) ──────
function AgentStation({ c, r, name, role, tier, state, senior, onClick }: {
  c: number; r: number; name: string; role: string; tier: string;
  state: State; senior: boolean; onClick: () => void;
}) {
  const color = TIER_COLOR[tier] ?? "#6b7280";
  return (
    <g
      opacity={state === "offline" ? 0.6 : 1}
      onClick={onClick}
      className="cursor-pointer group"
      style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* High-tech Base Struts (Hydraulic Detail) */}
      {[0.1, 1.9].flatMap(dc => [0.1, 1.9].map(dr => (
        <line key={`${dc}-${dr}`} x1={sx(c+dc, r+dr)} y1={sy(c+dc, r+dr)} x2={sx(c+1.1, r+1.1)} y2={sy(c+1.1, r+1.1)} stroke="#334155" strokeWidth={2} opacity={0.4} />
      )))}

      {/* Command Pod Aura Ring */}
      <ellipse cx={sx(c+1.1, r+1.1)} cy={sy(c+1.1, r+1.1)} rx={90} ry={45} fill="none" stroke={color} strokeWidth={1} opacity={0.2} strokeDasharray="1,20" />
      
      <Desk      c={c}       r={r}       state={state}                    />
      <Chair     c={c}       r={r}       color={color} senior={senior}     />
      <Monitor   c={c+1.15}  r={r+0.28}  state={state}                    />
      {senior && (
        <g transform="translate(-20, 5)">
          <Monitor c={c+0.45} r={r+0.20}
            state={state === "working" ? "reviewing" : state === "idle" ? "idle" : state} />
        </g>
      )}

      {/* Advanced Holographic Terminal */}
      <g transform={`translate(${sx(c+2.0, r+1.8)}, ${sy(c+2.0, r+1.8)-115})`} opacity={0.8}>
        <rect width={60} height={42} rx={8} fill={color} opacity={0.05} stroke={color} strokeWidth={1} filter="url(#glow)" />
        <path d="M 0 6 L 60 6" stroke={color} strokeWidth={0.5} opacity={0.4} />
        {[0,1,2,3].map(i => (
          <rect key={i} x={6} y={12+i*7} width={Math.random()*40 + 5} height={1.2} fill={color} opacity={0.5} />
        ))}
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur={`${3 + Math.random()}s`} repeatCount="indefinite" additive="sum" />
      </g>

      <AgentFigure c={c+1.1} r={r+1.9} color={color} state={state} role={role} />
      <AgentPanel  c={c}     r={r}      name={name} role={role} state={state} tier={tier} />
    </g>
  );
}

// ─── 9. CommandCore — OPI central throne (Architect Pass) ────────────────────
function CommandCore({ state }: { state: State }) {
  const c = CX - 1.5, r = CY - 1.5;
  const glowColor = state === "offline" ? "#475569" : "#10b981";

  return (
    <g>
      {/* Decorative Hex-Grid Base */}
      {[0, 60, 120, 180, 240, 300].map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x1 = sx(CX, CY), y1 = sy(CX, CY);
        const x2 = x1 + Math.cos(rad) * 120, y2 = y1 + Math.sin(rad) * 60;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={glowColor} strokeWidth={0.5} opacity={0.15} />;
      })}

      {/* Base Platform (Tiered with Struts) */}
      <IsoBox c={c-1.2} r={r-1.2} w={4.4} d={4.4} h={4} top="#020617" left="#020617" right="#020208" />
      <IsoBox c={c-0.5} r={r-0.5} w={3} d={3} h={12} top="#0a122a" left="#0a122a" right="#050814" />
      
      {/* Drifting Data Particles */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <circle key={i} r={1.5} fill={glowColor} filter="url(#glow)">
          <animate attributeName="cx" values={`${sx(CX,CY)-20}; ${sx(CX,CY)+20}; ${sx(CX,CY)-20}`} dur={`${5+i}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${sy(CX,CY)}; ${sy(CX,CY)-200}`} dur={`${4+i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${4+i}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Vertical Data Beams */}
      {[ -50, 0, 50 ].map((off, i) => (
        <line key={i} x1={sx(CX, CY) + off} y1={sy(CX, CY)} x2={sx(CX, CY) + off} y2={sy(CX, CY) - 500} 
              stroke={glowColor} strokeWidth={0.5} opacity={0.08}>
          <animate attributeName="opacity" values="0;0.2;0" dur={`${2+i}s`} repeatCount="indefinite" />
        </line>
      ))}

      {/* Holographic Spire */}
      <g opacity={0.8}>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="4s" repeatCount="indefinite" />
        
        {/* Core Pillar */}
        <path d={`M ${sx(CX, CY)-25} ${sy(CX, CY)-20} L ${sx(CX, CY)+25} ${sy(CX, CY)-20} L ${sx(CX, CY)} ${sy(CX, CY)-160} Z`} 
              fill={glowColor} opacity={0.08} filter="url(#glow)" />
        
        {/* Complex Rotating Rings */}
        {[1, 1.4, 1.8, 2.2].map((m, i) => (
          <g key={i}>
            <ellipse cx={sx(CX, CY)} cy={sy(CX, CY)-40-i*25} rx={30*m} ry={12*m} fill="none" stroke={glowColor} strokeWidth={0.5} opacity={0.3}>
              <animate attributeName="stroke-dasharray" values="1,155; 155,1; 1,155" dur={`${5+i}s`} repeatCount="indefinite" />
            </ellipse>
            <circle r={2.5} fill={glowColor} filter="url(#glow)">
              <animateMotion path={`M ${-30*m},0 a ${30*m},${12*m} 0 1,0 ${60*m},0 a ${30*m},${12*m} 0 1,0 ${-60*m},0`} 
                             dur={`${7+i}s`} repeatCount="indefinite" rotate="auto" />
            </circle>
          </g>
        ))}

        <circle cx={sx(CX, CY)} cy={sy(CX, CY)-170} r={12} fill={glowColor} filter="url(#glow)">
           <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      <text x={sx(CX, CY)} y={sy(CX, CY) + 35} textAnchor="middle" fill={glowColor} fontSize={11} fontWeight="900" fontFamily="monospace" letterSpacing={8} opacity={0.5}>
        OPI CORE ASCENDANT
      </text>
    </g>
  );
}

// ─── 9.1 ServerRack — Environmental detail ────────────────────────────────────
function ServerRack({ c, r, h = 40 }: { c: number; r: number; h?: number }) {
  return (
    <g opacity={0.9}>
      <IsoBox c={c} r={r} w={1.2} d={1.2} h={h} top="#0a0e1a" left="#05080f" right="#020408" />
      {/* Vents & Cooling patterns */}
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <line key={i} x1={sx(c+0.1, r+1.2)} y1={sy(c+0.1, r+1.2)-h*f} x2={sx(c+1.1, r+1.2)} y2={sy(c+1.1, r+1.2)-h*f} stroke="#ffffff" strokeWidth={0.2} opacity={0.1} />
      ))}
      {/* Multi-colored status LEDs */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={sx(c, r+1.2)+6} y={sy(c, r+1.2)-(h*0.1)-i*8} width={3} height={2} fill={i % 3 === 0 ? "#10b981" : "#06b6d4"} opacity={0.6} rx={1}>
           <animate attributeName="opacity" values="0.1;0.9;0.1" dur={`${0.8+i*0.2}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  );
}

// ─── 9.2 PowerConduit — Floor details ─────────────────────────────────────────
function PowerConduit({ c1, r1, c2, r2 }: { c1: number; r1: number; c2: number; r2: number }) {
  const pts = [pt(sx(c1,r1), sy(c1,r1)), pt(sx(c2,r1), sy(c2,r1)), pt(sx(c2,r2), sy(c2,r2))].join(" L ");
  return (
    <g>
      <path d={`M ${pts}`} fill="none" stroke="#10b981" strokeWidth={0.5} opacity={0.1} />
      <path d={`M ${pts}`} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5,50" opacity={0.4} filter="url(#glow)">
        <animate attributeName="stroke-dashoffset" from="55" to="0" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

// ─── 10. DataPulse — animated Manhattan routing ───────────────────────────────
function DataPulse({ c1, r1, c2, r2, color = "#38bdf8", delay = "0s" }: {
  c1: number; r1: number; c2: number; r2: number; color?: string; delay?: string;
}) {
  const d = `M ${sx(c1,r1)} ${sy(c1,r1)} L ${sx(c2,r1)} ${sy(c2,r1)} L ${sx(c2,r2)} ${sy(c2,r2)}`;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={0.7} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5}
        strokeDasharray="8,110" opacity={0.55} filter="url(#glow)">
        <animate attributeName="stroke-dashoffset"
          from="118" to="0" dur="3s" begin={delay} repeatCount="indefinite" />
      </path>
    </g>
  );
}

// ─── 11. HydratedStation — wires API state into AgentStation ─────────────────
function HydratedStation({
  node, agentMap, signedIn, c, r, senior, onSelect,
}: {
  node: ReturnType<typeof flattenTree>[number];
  agentMap: Map<string, AgentRead>;
  signedIn: boolean;
  c: number; r: number; senior: boolean;
  onSelect: (id: string, px: number, py: number) => void;
}) {
  return (
    <HydratedStationInner
      node={node}
      agentMap={agentMap}
      signedIn={signedIn}
      c={c} r={r} senior={senior}
      onSelect={onSelect}
    />
  );
}

function HydratedStationInner({
  node, agentMap, signedIn, c, r, senior, onSelect,
}: {
  node: ReturnType<typeof flattenTree>[number];
  agentMap: Map<string, AgentRead>;
  signedIn: boolean;
  c: number; r: number; senior: boolean;
  onSelect: (id: string, px: number, py: number) => void;
}) {
  const agent = agentMap.get(node.id) ?? agentMap.get(node.name.toLowerCase()) ?? null;
  const q = useListTasksApiV1BoardsBoardIdTasksGet(
    node.boardId ?? "",
    { status: "in_progress", limit: 1 },
    { query: { enabled: !!node.boardId && signedIn, refetchInterval: 15_000 } }
  );
  const task = q.data?.status === 200 ? (q.data.data.items?.[0] ?? null) : null;

  // Staleness check: treat as offline if last ping > 2h ago, regardless of status field
  const isReallyOnline = (() => {
    if (!agent) return false;
    const raw = (agent as unknown as { last_seen_at?: string }).last_seen_at;
    if (!raw) return (agent.status ?? "").toLowerCase() === "online";
    try {
      const dt = new Date(raw.endsWith("Z") || raw.includes("+") ? raw : raw + "Z");
      if (isNaN(dt.getTime())) return false;
      return (Date.now() - dt.getTime()) < 2 * 3600000; // <2h
    } catch { return false; }
  })();

  const state: State =
    !agent          ? "idle"      :
    !isReallyOnline ? "offline"   :
    !task           ? "idle"      :
    (task.title ?? "").toLowerCase().includes("review") ? "reviewing" :
    "working";

  return (
    <AgentStation
      c={c} r={r}
      name={node.name} role={node.role} tier={node.tier}
      state={state} senior={senior}
      onClick={() => onSelect(node.id, sx(c+1, r+1), sy(c+1, r+1))}
    />
  );
}

// ─── 12. AgentDetailPanel — side HUD ─────────────────────────────────────────
function AgentDetailPanel({
  node, agent, onClose,
}: {
  node: ReturnType<typeof flattenTree>[number];
  agent: AgentRead | null;
  onClose: () => void;
}) {
  const q = useListTasksApiV1BoardsBoardIdTasksGet(
    node.boardId ?? "",
    { limit: 20 },
    { query: { enabled: !!node.boardId, refetchInterval: 15_000 } }
  );
  const tasks = q.data?.status === 200 ? (q.data.data.items ?? []) : [];
  const todo  = tasks.filter(t => (t.status as string) === "todo").length;
  const doing = tasks.filter(t => (t.status as string) === "in_progress").length;
  const done  = tasks.filter(t => (t.status as string) === "done").length;
  const color = TIER_COLOR[node.tier] ?? "#6b7280";

  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  return (
    <div className="absolute right-6 top-24 bottom-6 w-[360px] z-50 animate-in slide-in-from-right duration-400">
      <div className="h-full rounded-2xl border border-white/10 bg-[#020617]/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl border border-white/10"
              style={{ backgroundColor: `${color}20`, color }}>
              {node.emoji}
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight leading-none mb-1">{node.name}</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em]">{node.role}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          <div className="flex px-6 space-x-4 border-b border-white/5">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`pb-2 text-[10px] font-bold uppercase tracking-widest ${activeTab === "overview" ? "text-white border-b-2 border-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("logs")}
              className={`pb-2 text-[10px] font-bold uppercase tracking-widest ${activeTab === "logs" ? "text-white border-b-2 border-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              Logs
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "overview" ? (
              <div className="h-full overflow-y-auto p-6 space-y-6">
                {/* Responsibility */}
                <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Primary Directive</h3>
                  <p className="text-sm text-slate-300 leading-relaxed italic bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    "{node.responsibility}"
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "TODO",   v: todo,  c: "text-slate-400" },
                    { l: "ACTIVE", v: doing, c: "text-emerald-400" },
                    { l: "DONE",   v: done,  c: "text-blue-400" },
                  ].map(s => (
                    <div key={s.l} className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                      <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                      <div className="text-[7px] font-black text-slate-500 tracking-widest">{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Online status */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    agent?.status === "online"
                      ? "bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse"
                      : "bg-slate-600"
                  }`} />
                  <span className="text-xs font-bold text-slate-300">
                    {agent?.status === "online" ? "ONLINE — ACTIVE" : "OFFLINE"}
                  </span>
                  <span className="ml-auto text-[9px] text-slate-600 font-mono">{node.model}</span>
                </div>

                {/* Recent tasks */}
                {tasks.length > 0 && (
                  <div>
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Recent Directives</h3>
                    <div className="space-y-2">
                      {tasks.slice(0, 5).map(t => (
                        <div key={t.id}
                          className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-3">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                            (t.status as string) === "done"        ? "bg-blue-400" :
                            (t.status as string) === "in_progress" ? "bg-emerald-400" :
                            "bg-amber-400"
                          }`} />
                          <p className="text-[11px] text-slate-300 truncate font-medium">{t.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full p-4">
                <LogViewer agentName={node.name} agentId={node.id} />
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

// ─── Agent coordinate layout (Isometric-Aware Round Table) ───────────────────
function getCoords(index: number, total: number): { c: number; r: number } {
  // Calibrated ScreenRadius to ensure all 8 agents (with 3x3 bases)
  // stay strictly within the 20x20 floor grid [0..20].
  const ScreenRadius = 245; 
  const angle = (360 / total) * index - 90; // Start from North
  const rad = (angle * Math.PI) / 180;

  // Projection math: X_screen = (c-r)*40, Y_screen = (c+r)*20
  const c_rel = 0.5 * ((ScreenRadius / 40) * Math.cos(rad) + (ScreenRadius / 20) * Math.sin(rad));
  const r_rel = 0.5 * ((ScreenRadius / 20) * Math.sin(rad) - (ScreenRadius / 40) * Math.cos(rad));

  return {
    c: CX + c_rel - 1.1,
    r: CY + r_rel - 1.1,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VirtualOfficePage() {
  const { isSignedIn } = useAuth();
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [viewPos,    setViewPos]      = useState({ x: 0, y: 0 });

  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 200 },
    { query: { enabled: Boolean(isSignedIn), refetchInterval: 15_000, refetchOnMount: "always" } }
  );

  const agentMap = useMemo(() => {
    const map = new Map<string, AgentRead>();
    if (agentsQ.data?.status === 200) {
      for (const a of agentsQ.data.data.items ?? []) {
        map.set(a.id, a);
        map.set(a.name.toLowerCase(), a);
      }
    }
    return map;
  }, [agentsQ.data]);

  const allNodes    = flattenTree(ORG_TREE);
  const onlineCount = useMemo(() => {
    if (agentsQ.data?.status !== 200) return 0;
    return (agentsQ.data.data.items ?? [])
      .filter(a => (a.status ?? "").toLowerCase() === "online").length;
  }, [agentsQ.data]);

  const zones = useMemo(() => ({
    root:       allNodes.filter(n => n.tier === "root"),
    swarm:      allNodes.filter(n => n.tier !== "root"),
  }), [allNodes]);

  const sortedSwarm = useMemo(() => {
    return zones.swarm.map((node, i) => ({
      node,
      coords: getCoords(i, zones.swarm.length)
    })).sort((a, b) => (a.coords.c + a.coords.r) - (b.coords.c + b.coords.r));
  }, [zones.swarm]);

  // ViewBox — Perfectly centered and responsive
  const PAD_X = 80, PAD_Y = 160;
  const rawMinX = sx(0, ROWS) - PAD_X;
  const rawMaxX = sx(COLS, 0) + PAD_X;
  const sceneCenterY = sy(CX, CY);   

  // Dynamic Viewport Height based on aspect ratio approximation
  const halfH = typeof window !== "undefined" ? Math.max(480, (window.innerHeight / 2) * 0.8) : 520; 
  const currentMinY = sceneCenterY - halfH;
  const currentMaxY = sceneCenterY + halfH;

  const defaultW = rawMaxX - rawMinX;
  const defaultH = currentMaxY - currentMinY;

  const vb = useMemo(() => {
    if (!selectedId) return `${rawMinX} ${currentMinY} ${defaultW} ${defaultH}`;
    // Zoom focus with safe margins
    const zoomScale = 2.5;
    const tw = defaultW / zoomScale;
    const th = defaultH / zoomScale;
    return `${viewPos.x - tw / 2} ${viewPos.y - th / 2} ${tw} ${th}`;
  }, [selectedId, viewPos, rawMinX, currentMinY, defaultW, defaultH]);

  const selectedNode = allNodes.find(n => n.id === selectedId);

  const handleSelect = (id: string, px: number, py: number) => {
    if (selectedId === id) { setSelectedId(null); return; }
    setSelectedId(id);
    setViewPos({ x: px, y: py });
  };

  // OPI state (for CommandCore color)
  const opiAgent = agentMap.get("main") ?? agentMap.get("opi") ?? null;
  const opiOnline = (opiAgent?.status ?? "").toLowerCase() === "online";
  const opiState: State = !opiAgent ? "idle" : !opiOnline ? "offline" : "working";

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel message="Sign in to view the Virtual Office."
          forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding" />
      </SignedOut>

      <SignedIn>
        <DashboardSidebar />

        {/* Animations */}
        <style jsx global>{`
          @keyframes ledBlink {
            0%,100% { opacity:0.3; }
            50%      { opacity:1; }
          }
          .led { animation: ledBlink 2s ease-in-out infinite; }
        `}</style>

        <main className="flex-1 overflow-auto bg-slate-950 relative">

          {/* ── TOP HUD ───────────────────────────────────────────────────── */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between pointer-events-none">

            {/* Title */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl pointer-events-auto">
              <h1 className="font-black text-xl text-white tracking-widest flex items-center gap-3">
                <span className="text-3xl text-emerald-400">⬢</span> COMMAND CITADEL
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] text-slate-400 font-mono tracking-wide">ISOMETRIC OVERSIGHT · REFRESH: 15S</p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
              </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full px-5 py-2 flex items-center gap-5 pointer-events-auto mt-2">
              {[
                { dot: "bg-emerald-500",  label: "Working"   },
                { dot: "bg-amber-500",    label: "Reviewing" },
                { dot: "bg-blue-500",     label: "Idle"      },
                { dot: "bg-slate-600",    label: "Offline"   },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Telemetry */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl pointer-events-auto min-w-[210px]">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Swarm Telemetry</h3>
                <Link href="/org-tree" className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  ORG TREE <span className="text-base">↗</span>
                </Link>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">TOTAL NODES</span>
                <span className="text-lg font-black text-white font-mono">{allNodes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">ACTIVE LINKS</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{onlineCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── SVG OFFICE ────────────────────────────────────────────────── */}
          <div className="flex items-start justify-center p-4">
            <svg viewBox={vb}
              style={{ width: "100%", maxWidth: 1600 }}
              xmlns="http://www.w3.org/2000/svg">

              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="softBlur">
                  <feGaussianBlur stdDeviation="6" />
                </filter>

                {/* Volumetric Gradients for Hyper-Detailed Evolution */}
                <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                   <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
                   <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                </linearGradient>

                {Array.from(new Set(Object.values(TIER_COLOR))).map(c => (
                  <linearGradient key={c} id={`grad-${c.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor={c} />
                     <stop offset="40%" stopColor={c} />
                     <stop offset="60%" stopColor="#ffffff" stopOpacity={0.3} />
                     <stop offset="100%" stopColor={c} />
                  </linearGradient>
                ))}
                <linearGradient id="grad-offline" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#1e293b" />
                   <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#010610" />
                  <stop offset="100%" stopColor="#020b1f" />
                </linearGradient>
              </defs>

              {/* Sky background */}
              <rect x={rawMinX} y={currentMinY} width={defaultW} height={defaultH} fill="url(#bgGrad)" />

              {/* Background text */}
              <text
                x={sx(CX, 0)} y={sy(CX, 0) - 120}
                fill="#38bdf8" fontSize={52} fontWeight="900"
                opacity={0.05} textAnchor="middle" letterSpacing={30}
                fontFamily="monospace">
                COMMAND_CITADEL
              </text>

              {/* Boundary walls */}
              <IsoBox c={0} r={0} w={COLS} d={0.2} h={36}
                top="rgba(255,255,255,0.04)" left="rgba(59,130,246,0.12)" right="rgba(59,130,246,0.04)" />
              <IsoBox c={0} r={0} w={0.2} d={ROWS} h={36}
                top="rgba(255,255,255,0.04)" left="rgba(59,130,246,0.04)" right="rgba(59,130,246,0.12)" />
              <IsoBox c={COLS-0.2} r={0} w={0.2} d={ROWS} h={6}
                top="#334155" left="#1e293b" right="#0f172a" />
              <IsoBox c={0} r={ROWS-0.2} w={COLS} d={0.2} h={6}
                top="#334155" left="#1e293b" right="#0f172a" />

              {/* Floor and Central Ambience */}
              <ellipse cx={sx(CX, CY)} cy={sy(CX, CY)} rx={600} ry={300} fill="url(#centralGlow)" />
              
              {/* Floor Structure (Outer Rail) */}
              <IsoBox c={-0.5} r={-0.5} w={21} d={21} h={2} top="#1e293b" left="#0f172a" right="#020617" />
              <Floor />

              {/* High-Density Server Racks (Peripheral Infrastructure) */}
              <ServerRack c={0}  r={0}  h={80} />
              <ServerRack c={19} r={0}  h={80} />
              <ServerRack c={0}  r={19} h={60} />
              <ServerRack c={19} r={19} h={60} />

              {/* Power Conduits (Neon Lifelines connecting the Round Table) */}
              {sortedSwarm.map(({ node }, i) => {
                const coords = getCoords(i, sortedSwarm.length);
                return (
                  <PowerConduit 
                    key={`conduit-${node.id}`}
                    c1={CX} r1={CY} 
                    c2={coords.c + 1.1} r2={coords.r + 1.1} 
                  />
                );
              })}
              
              <CommandCore state={opiState} />

              {/* ── UNIFIED SWARM LAYER (Round Table) ───────────────────────── */}
              {sortedSwarm.map(({ node, coords }) => (
                <HydratedStation 
                  key={node.id} 
                  node={node} 
                  agentMap={agentMap} 
                  signedIn={!!isSignedIn}
                  c={coords.c} 
                  r={coords.r} 
                  senior={node.tier === "sub"} 
                  onSelect={handleSelect} 
                />
              ))}
            </svg>
          </div>

          {/* ── AGENT DETAIL PANEL ────────────────────────────────────────── */}
          {selectedId && selectedNode && (
            <AgentDetailPanel
              node={selectedNode}
              agent={agentMap.get(selectedId) ?? null}
              onClose={() => setSelectedId(null)}
            />
          )}
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
