"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import { Bot, CheckCircle2, ChevronRight, Goal } from "lucide-react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { ActivityHeatmap } from "@/components/organisms/ActivityHeatmap";
import {
  useListAgentsApiV1AgentsGet,
  type listAgentsApiV1AgentsGetResponse,
} from "@/api/generated/agents/agents";
import {
  useListTasksApiV1BoardsBoardIdTasksGet,
  type listTasksApiV1BoardsBoardIdTasksGetResponse,
} from "@/api/generated/tasks/tasks";
import {
  useListBoardsApiV1BoardsGet,
  type listBoardsApiV1BoardsGetResponse,
} from "@/api/generated/boards/boards";
import type { TaskCardRead, BoardRead } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseTs(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  try {
    const s = raw.endsWith("Z") || raw.includes("+") ? raw : raw + "Z";
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function ageDays(raw: string | null | undefined): number {
  const d = parseTs(raw);
  if (!d) return Infinity;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
}

// ─── Board Scanner ──────────────────────────────────────────────────────────
function BoardScanner({
  board,
  signedIn,
  onTasksLoaded,
}: {
  board: BoardRead;
  signedIn: boolean;
  onTasksLoaded: (tasks: { task: TaskCardRead; board: BoardRead }[]) => void;
}) {
  const tasksQ = useListTasksApiV1BoardsBoardIdTasksGet<listTasksApiV1BoardsBoardIdTasksGetResponse, ApiError>(
    board.id,
    { limit: 200 },
    { query: { enabled: signedIn, staleTime: 60_000 } }
  );

  useMemo(() => {
    if (tasksQ.data?.status === 200) {
      const items = tasksQ.data.data.items ?? [];
      onTasksLoaded(items.map(task => ({ task, board })));
    }
  // eslint-disable-next-line
  }, [tasksQ.data]);

  return null;
}

// ─── Sprint Page ────────────────────────────────────────────────────────────
export default function SprintPage() {
  const { isSignedIn } = useAuth();
  
  const [allTasks, setAllTasks] = useState<{ task: TaskCardRead; board: BoardRead }[]>([]);

  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 },
    { query: { enabled: Boolean(isSignedIn), staleTime: 60_000 } }
  );

  const boardsQ = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    undefined,
    { query: { enabled: Boolean(isSignedIn), staleTime: 60_000 } }
  );

  const boards = useMemo(() =>
    boardsQ.data?.status === 200 ? (boardsQ.data.data.items ?? []) : [],
    [boardsQ.data]
  );
  
  const agents = useMemo(() =>
    agentsQ.data?.status === 200 ? (agentsQ.data.data.items ?? []) : [],
    [agentsQ.data]
  );

  // Map tasks to agents
  const agentTasks = useMemo(() => {
    const map = new Map<string, typeof allTasks>();
    for (const a of agents) map.set(a.id, []);
    for (const t of allTasks) {
      const aId = typeof t.task.assignee === "string" ? t.task.assignee : (t.task.assignee as any)?.id;
      if (aId && map.has(aId)) {
        map.get(aId)!.push(t);
      }
    }
    return map;
  }, [allTasks, agents]);

  if (!isSignedIn) {
    return <div className="p-8 text-slate-400">Sign in to view sprint board.</div>;
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sprint Board</h1>
              <p className="text-sm text-slate-500 mt-0.5">Weekly agent throughput and metrics.</p>
            </div>
            {/* hidden scanners */}
            {boards.map(b => (
              <BoardScanner
                key={`bscan-${b.id}`}
                board={b}
                signedIn={Boolean(isSignedIn)}
                onTasksLoaded={items => setAllTasks(prev => {
                  const keep = prev.filter(x => x.board.id !== b.id);
                  return [...keep, ...items];
                })}
              />
            ))}
          </div>

          <div className="space-y-6">
            {agents.map(agent => {
              const tasks = agentTasks.get(agent.id) ?? [];
              const doneThisWeek = tasks.filter(t => t.task.status === "done" && ageDays(t.task.updated_at) <= 7);
              const inProgress = tasks.filter(t => t.task.status === "in_progress");
              const review = tasks.filter(t => t.task.status === "review");
              
              // Mock heatmap data based on tasks updated recently
              // In the future this should come from /api/v1/activity filtered by agent_id
              const heatData = tasks
                .filter(t => ageDays(t.task.updated_at) <= 7)
                .map(t => ({ timestamp: t.task.updated_at ?? "", weight: 1 }));

              return (
                <div key={agent.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Header */}
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Bot size={16} />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">{agent.name}</h2>
                        <p className="text-xs text-slate-500">
                          {(agent as any).identity_profile?.role ?? "Agent"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-slate-900">{doneThisWeek.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Done (7d)</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-blue-600">{inProgress.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">WIP</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-amber-600">{review.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Review</span>
                      </div>
                    </div>
                  </div>

                  {/* Body columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-0">
                    
                    {/* Inbox/Goals mock */}
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Goal size={14} className="text-slate-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sprint Goal</h3>
                      </div>
                      <textarea 
                        className="w-full h-20 p-2 text-sm bg-slate-50 border border-slate-200 rounded min-h-[80px] text-slate-700 resize-none outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Set a weekly goal for this agent..."
                        defaultValue={`Drive progress on assigned boards.`}
                      />
                    </div>

                    {/* WIP */}
                    <div className="p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">In Progress</h3>
                      <div className="space-y-2">
                        {inProgress.length === 0 ? (
                          <p className="text-xs text-slate-400">No active tasks.</p>
                        ) : inProgress.slice(0, 3).map(t => (
                          <Link key={t.task.id} href={`/boards/${t.board.id}?taskId=${t.task.id}`} className="block border border-slate-200 rounded p-2 hover:border-blue-300 hover:bg-blue-50 transition">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">{t.task.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{t.board.name}</p>
                          </Link>
                        ))}
                        {inProgress.length > 3 && (
                          <p className="text-xs font-medium text-blue-600 pl-1">+ {inProgress.length - 3} more</p>
                        )}
                      </div>
                    </div>

                    {/* Heatmap */}
                    <div className="p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Activity Heatmap (7d)</h3>
                      <ActivityHeatmap data={heatData} days={7} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
