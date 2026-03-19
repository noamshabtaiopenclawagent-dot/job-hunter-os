"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bot, AlertTriangle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import {
  useListAgentsApiV1AgentsGet,
  type listAgentsApiV1AgentsGetResponse,
} from "@/api/generated/agents/agents";
import {
  useListTasksApiV1BoardsBoardIdTasksGet,
  type listTasksApiV1BoardsBoardIdTasksGetResponse,
} from "@/api/generated/tasks/tasks";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import type { AgentRead } from "@/api/generated/model";

// ─── Staleness helpers ────────────────────────────────────────────────────────
function parseLastSeen(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  try {
    // Handle both TZ-aware and naive timestamps
    const normalized = raw.endsWith("Z") || raw.includes("+") ? raw : raw + "Z";
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

type AgentHealth = "online" | "stale" | "offline" | "unknown";

function agentHealth(agent: AgentRead): AgentHealth {
  const dt = parseLastSeen((agent as unknown as { last_seen_at?: string }).last_seen_at);
  if (!dt) return "unknown";
  const ageMin = (Date.now() - dt.getTime()) / 60000;
  if (ageMin > 120) return "offline";
  if (ageMin > 30) return "stale";
  return "online";
}

function agentAgeLabel(agent: AgentRead): string {
  const dt = parseLastSeen((agent as unknown as { last_seen_at?: string }).last_seen_at);
  if (!dt) return "no ping";
  const ageMin = Math.floor((Date.now() - dt.getTime()) / 60000);
  if (ageMin < 60) return `${ageMin}m ago`;
  const h = Math.floor(ageMin / 60);
  return `${h}h ago`;
}

function agentModel(agent: AgentRead): string {
  const a = agent as unknown as {
    identity_profile?: { model?: string };
    heartbeat_config?: { model?: string };
    openclaw_session_id?: string;
  };
  return a.identity_profile?.model ?? a.heartbeat_config?.model ?? "—";
}

function agentBoardId(agent: AgentRead): string | null {
  return (agent as unknown as { board_id?: string }).board_id ?? null;
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
const HEALTH_CONFIG: Record<AgentHealth, { dot: string; label: string; text: string; bg: string; border: string }> = {
  online:  { dot: "bg-emerald-500", label: "Online",  text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  stale:   { dot: "bg-amber-400",   label: "Stale",   text: "text-amber-700",  bg: "bg-amber-50",    border: "border-amber-200" },
  offline: { dot: "bg-red-500",     label: "Offline", text: "text-red-700",    bg: "bg-red-50",      border: "border-red-200" },
  unknown: { dot: "bg-slate-300",   label: "Unknown", text: "text-slate-500",  bg: "bg-slate-50",    border: "border-slate-200" },
};

function AgentCard({ agent }: { agent: AgentRead }) {
  const { isSignedIn } = useAuth();
  const boardId = agentBoardId(agent);
  const health = agentHealth(agent);
  const cfg = HEALTH_CONFIG[health];
  const model = agentModel(agent);
  const age = agentAgeLabel(agent);

  const tasksQ = useListTasksApiV1BoardsBoardIdTasksGet<listTasksApiV1BoardsBoardIdTasksGetResponse, ApiError>(
    boardId ?? "",
    { limit: 200 },
    { query: { enabled: Boolean(isSignedIn && boardId), refetchInterval: 30_000 } }
  );

  const taskCounts = useMemo(() => {
    if (tasksQ.data?.status !== 200 || !boardId) return null;
    const tasks = tasksQ.data.data.items ?? [];
    return {
      active: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
    };
  }, [tasksQ.data, boardId]);

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${cfg.bg} ${cfg.border}`}
      style={{ minWidth: 130, maxWidth: 180 }}
    >
      {/* Pulse dot */}
      <div className="relative flex shrink-0 mt-0.5">
        <span className={`relative flex h-2 w-2`}>
          {health === "online" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className={`font-bold leading-none mb-0.5 ${cfg.text}`}>
          {agent.name}
        </div>
        {model !== "—" && (
          <div className="text-[10px] text-slate-400 truncate">{model}</div>
        )}
        <div className="mt-1 flex items-center gap-1">
          <span className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-400">{age}</span>
        </div>
        {taskCounts && (
          <div className="mt-1 text-[10px] text-slate-400">
            {taskCounts.active > 0 && (
              <span className="mr-1.5 font-medium text-amber-600">{taskCounts.active} active</span>
            )}
            {taskCounts.review > 0 && (
              <span className="font-medium text-violet-600">{taskCounts.review} review</span>
            )}
            {taskCounts.active === 0 && taskCounts.review === 0 && (
              <span className="text-slate-300">idle</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AgentStatusBar ───────────────────────────────────────────────────────────
export function AgentStatusBar() {
  const { isSignedIn } = useAuth();

  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 30_000,
        refetchOnMount: "always",
      },
    }
  );

  const agents = useMemo(() => {
    if (agentsQ.data?.status !== 200) return [];
    return agentsQ.data.data.items ?? [];
  }, [agentsQ.data]);

  const summary = useMemo(() => {
    const h = agents.map(agentHealth);
    return {
      online: h.filter((x) => x === "online").length,
      stale: h.filter((x) => x === "stale").length,
      offline: h.filter((x) => x === "offline").length,
    };
  }, [agents]);

  if (!isSignedIn) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-800">Agent Status</h3>
          {/* Summary pills */}
          <div className="ml-2 flex items-center gap-1.5 text-[10px]">
            {summary.online > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700">
                <CheckCircle2 size={8} /> {summary.online}
              </span>
            )}
            {summary.stale > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 font-bold text-amber-700">
                <Clock size={8} /> {summary.stale} stale
              </span>
            )}
            {summary.offline > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 font-bold text-red-700">
                <AlertTriangle size={8} /> {summary.offline} offline
              </span>
            )}
          </div>
        </div>
        <Link href="/virtual-office" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition-colors">
          Virtual Office <ExternalLink size={10} />
        </Link>
      </div>

      {/* Agent cards row */}
      <div className="flex flex-wrap gap-2 p-4">
        {agentsQ.isLoading && (
          <div className="w-full py-4 text-center text-sm text-slate-400 animate-pulse">Loading agents…</div>
        )}
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        {!agentsQ.isLoading && agents.length === 0 && (
          <div className="w-full py-4 text-center text-sm text-slate-400">No agents registered</div>
        )}
      </div>
    </section>
  );
}
