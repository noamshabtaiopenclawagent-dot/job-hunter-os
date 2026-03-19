"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Timer,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import {
  useListAgentsApiV1AgentsGet,
  type listAgentsApiV1AgentsGetResponse,
} from "@/api/generated/agents/agents";
import {
  useListBoardsApiV1BoardsGet,
  type listBoardsApiV1BoardsGetResponse,
} from "@/api/generated/boards/boards";
import {
  useListTasksApiV1BoardsBoardIdTasksGet,
  type listTasksApiV1BoardsBoardIdTasksGetResponse,
} from "@/api/generated/tasks/tasks";
import {
  useListApprovalsApiV1BoardsBoardIdApprovalsGet,
  type listApprovalsApiV1BoardsBoardIdApprovalsGetResponse,
} from "@/api/generated/approvals/approvals";
import type { AgentRead, BoardRead, TaskCardRead, ApprovalRead } from "@/api/generated/model";

// ─── Time helpers ─────────────────────────────────────────────────────────────
function parseTs(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  try {
    const s = raw.endsWith("Z") || raw.includes("+") ? raw : raw + "Z";
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function ageMin(raw: string | null | undefined): number {
  const d = parseTs(raw);
  if (!d) return Infinity;
  return (Date.now() - d.getTime()) / 60000;
}

function fmtAge(min: number): string {
  if (!isFinite(min)) return "unknown";
  if (min < 60) return `${Math.floor(min)}m ago`;
  if (min < 1440) return `${Math.floor(min / 60)}h ago`;
  return `${Math.floor(min / 1440)}d ago`;
}

// ─── Section card ─────────────────────────────────────────────────────────────
function InboxSection({
  icon, title, count, tone, children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  tone: "red" | "amber" | "blue" | "slate";
  children: React.ReactNode;
}) {
  const tones = {
    red:   { header: "border-red-200 bg-red-50",   badge: "bg-red-100 text-red-700",   icon: "text-red-500" },
    amber: { header: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
    blue:  { header: "border-blue-200 bg-blue-50",  badge: "bg-blue-100 text-blue-700",  icon: "text-blue-500" },
    slate: { header: "border-slate-200 bg-slate-50", badge: "bg-slate-100 text-slate-600", icon: "text-slate-400" },
  }[tone];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-3 border-b ${tones.header}`}>
        <span className={tones.icon}>{icon}</span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1">{title}</h2>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${tones.badge}`}>{count}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {count === 0
          ? <p className="px-5 py-3 text-sm text-slate-400">No items — all clear ✓</p>
          : children}
      </div>
    </section>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function InboxRow({ label, sub, age, href, badge }: {
  label: string; sub?: string; age?: string; href?: string; badge?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
      </div>
      {badge && (
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700">{badge}</span>
      )}
      {age && <span className="shrink-0 text-[11px] text-slate-400">{age}</span>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Per-board tasks + approvals collector ────────────────────────────────────
function BoardScanner({
  board,
  signedIn,
  onStuck,
  onApprovals,
}: {
  board: BoardRead;
  signedIn: boolean;
  onStuck: (tasks: { task: TaskCardRead; board: BoardRead }[]) => void;
  onApprovals: (a: { approval: ApprovalRead; board: BoardRead }[]) => void;
}) {
  const tasksQ = useListTasksApiV1BoardsBoardIdTasksGet<listTasksApiV1BoardsBoardIdTasksGetResponse, ApiError>(
    board.id,
    { limit: 200 },
    { query: { enabled: signedIn, refetchInterval: 60_000 } }
  );

  const approvalsQ = useListApprovalsApiV1BoardsBoardIdApprovalsGet<listApprovalsApiV1BoardsBoardIdApprovalsGetResponse, ApiError>(
    board.id,
    { status: "pending" as "pending" | "approved" | "rejected", limit: 50 },
    { query: { enabled: signedIn, refetchInterval: 30_000 } }
  );

  useMemo(() => {
    if (tasksQ.data?.status === 200) {
      const items = tasksQ.data.data.items ?? [];
      const stuck = items.filter(t => {
        if (t.status !== "in_progress") return false;
        const age = ageMin(t.updated_at);
        return age > 72 * 60; // >72h
      });
      onStuck(stuck.map(task => ({ task, board })));
    }
  // eslint-disable-next-line
  }, [tasksQ.data]);

  useMemo(() => {
    if (approvalsQ.data?.status === 200) {
      const items = approvalsQ.data.data.items ?? [];
      onApprovals(items.map(approval => ({ approval, board })));
    }
  // eslint-disable-next-line
  }, [approvalsQ.data]);

  return null;
}

// ─── Main Inbox Page ──────────────────────────────────────────────────────────
export default function InboxPage() {
  const { isSignedIn } = useAuth();
  const [stuckTasks, setStuckTasks] = useState<{ task: TaskCardRead; board: BoardRead }[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<{ approval: ApprovalRead; board: BoardRead }[]>([]);

  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 },
    { query: { enabled: Boolean(isSignedIn), refetchInterval: 30_000 } }
  );

  const boardsQ = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    undefined,
    { query: { enabled: Boolean(isSignedIn), refetchInterval: 60_000 } }
  );

  const boards = useMemo(() =>
    boardsQ.data?.status === 200 ? (boardsQ.data.data.items ?? []) : [],
    [boardsQ.data]
  );

  // ── Stale agents ────────────────────────────────────────────────────────
  const staleAgents = useMemo(() => {
    if (agentsQ.data?.status !== 200) return [];
    return (agentsQ.data.data.items ?? []).filter(a => {
      const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
      return ageMin(raw) > 30; // >30min = stale
    });
  }, [agentsQ.data]);

  const offlineAgents = staleAgents.filter(a => {
    const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
    return ageMin(raw) > 120; // >2h = offline
  });
  const warnAgents = staleAgents.filter(a => {
    const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
    const age = ageMin(raw);
    return age > 30 && age <= 120;
  });

  // ── Cron health ─────────────────────────────────────────────────────────
  const [cronIssues, setCronIssues] = useState<{ name: string; lastRun?: string }[]>([]);
  useMemo(() => {
    if (!isSignedIn) return;
    fetch("/api/health/cron-jobs")
      .then(r => r.json())
      .then(data => {
        const issues = (data.jobs ?? []).filter(
          (j: { health: string }) => j.health === "stale" || j.health === "unknown"
        );
        setCronIssues(issues.map((j: { name: string; last_run?: string }) => ({
          name: j.name,
          lastRun: j.last_run,
        })));
      })
      .catch(() => {});
  // eslint-disable-next-line
  }, [isSignedIn]);

  const totalIssues = offlineAgents.length + warnAgents.length + pendingApprovals.length + stuckTasks.length + cronIssues.length;

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Sign in to view your inbox.
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalIssues === 0
              ? "All systems nominal — nothing needs your attention."
              : `${totalIssues} item${totalIssues !== 1 ? "s" : ""} require attention`}
          </p>
        </div>
        {totalIssues === 0 && (
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        )}
      </div>

      {/* Hidden board scanners */}
      {boards.map(board => (
        <BoardScanner
          key={board.id}
          board={board}
          signedIn={Boolean(isSignedIn)}
          onStuck={items => setStuckTasks(prev => {
            const existing = prev.filter(x => x.board.id !== board.id);
            return [...existing, ...items];
          })}
          onApprovals={items => setPendingApprovals(prev => {
            const existing = prev.filter(x => x.board.id !== board.id);
            return [...existing, ...items];
          })}
        />
      ))}

      {/* Offline Agents */}
      <InboxSection
        icon={<XCircle size={15} />}
        title="Offline Agents (> 2h)"
        count={offlineAgents.length}
        tone="red"
      >
        {offlineAgents.map(a => {
          const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
          const ip = (a as unknown as { identity_profile?: { role?: string } }).identity_profile;
          return (
            <InboxRow
              key={a.id}
              label={a.name}
              sub={ip?.role ?? "Agent"}
              age={fmtAge(ageMin(raw))}
              href="/virtual-office"
              badge="OFFLINE"
            />
          );
        })}
      </InboxSection>

      {/* Pending Approvals */}
      <InboxSection
        icon={<ShieldAlert size={15} />}
        title="Pending Approvals"
        count={pendingApprovals.length}
        tone="amber"
      >
        {pendingApprovals.map(({ approval, board }) => (
          <InboxRow
            key={approval.id}
            label={approval.action_type ?? "Approval required"}
            sub={`Board: ${board.name} · ${approval.confidence ?? "?"}% confidence`}
            age={fmtAge(ageMin(approval.created_at))}
            href={`/boards/${board.id}?taskId=${approval.task_id}`}
          />
        ))}
      </InboxSection>

      {/* Stale Agents (warning) */}
      <InboxSection
        icon={<Clock size={15} />}
        title="Stale Agents (30 min – 2h)"
        count={warnAgents.length}
        tone="amber"
      >
        {warnAgents.map(a => {
          const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
          const ip = (a as unknown as { identity_profile?: { role?: string } }).identity_profile;
          return (
            <InboxRow
              key={a.id}
              label={a.name}
              sub={ip?.role ?? "Agent"}
              age={fmtAge(ageMin(raw))}
              href="/virtual-office"
              badge="STALE"
            />
          );
        })}
      </InboxSection>

      {/* Stuck Tasks */}
      <InboxSection
        icon={<AlertTriangle size={15} />}
        title="Stuck Tasks (> 72h in progress)"
        count={stuckTasks.length}
        tone="amber"
      >
        {stuckTasks.map(({ task, board }) => (
          <InboxRow
            key={task.id}
            label={task.title ?? "Untitled task"}
            sub={`Board: ${board.name}`}
            age={fmtAge(ageMin(task.updated_at))}
            href={`/boards/${board.id}?taskId=${task.id}`}
          />
        ))}
      </InboxSection>

      {/* Cron Issues */}
      <InboxSection
        icon={<Timer size={15} />}
        title="Cron Jobs — Stale or Unknown"
        count={cronIssues.length}
        tone={cronIssues.length > 0 ? "amber" : "slate"}
      >
        {cronIssues.map(c => (
          <InboxRow
            key={c.name}
            label={c.name}
            sub="Last run unknown or stale"
            age={c.lastRun ? fmtAge(ageMin(c.lastRun)) : undefined}
            href="/scheduled"
            badge="STALE"
          />
        ))}
      </InboxSection>
        </div>
      </main>
    </DashboardShell>
  );
}

// ─── Export a badge component for the sidebar ─────────────────────────────────
export function useInboxCount() {
  const { isSignedIn } = useAuth();
  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 },
    { query: { enabled: Boolean(isSignedIn), refetchInterval: 30_000 } }
  );
  return useMemo(() => {
    if (agentsQ.data?.status !== 200) return 0;
    return (agentsQ.data.data.items ?? []).filter(a => {
      const raw = (a as unknown as { last_seen_at?: string }).last_seen_at;
      return ageMin(raw) > 30;
    }).length;
  }, [agentsQ.data]);
}
