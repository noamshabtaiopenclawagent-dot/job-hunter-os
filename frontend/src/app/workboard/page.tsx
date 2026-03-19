"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { Layers, Search, Bot } from "lucide-react";
import Link from "next/link";
import {
  useListBoardsApiV1BoardsGet,
  type listBoardsApiV1BoardsGetResponse,
} from "@/api/generated/boards/boards";
import {
  useListTasksApiV1BoardsBoardIdTasksGet,
  type listTasksApiV1BoardsBoardIdTasksGetResponse,
} from "@/api/generated/tasks/tasks";
import {
  useListAgentsApiV1AgentsGet,
  type listAgentsApiV1AgentsGetResponse,
} from "@/api/generated/agents/agents";
import type { TaskCardRead, BoardRead, AgentRead } from "@/api/generated/model";
import { cn } from "@/lib/utils";

// ─── Scanners ───────────────────────────────────────────────────────────
function BoardTasksLoader({
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
    { limit: 300 },
    { query: { enabled: signedIn, staleTime: 30_000 } }
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

// ─── Columns Definition ─────────────────────────────────────────────────
const COLUMNS = [
  { id: "todo", title: "To Do", borderColor: "border-slate-300", headerBg: "bg-slate-100", headerText: "text-slate-700" },
  { id: "in_progress", title: "In Progress", borderColor: "border-blue-300", headerBg: "bg-blue-50", headerText: "text-blue-700" },
  { id: "review", title: "Review", borderColor: "border-amber-300", headerBg: "bg-amber-50", headerText: "text-amber-700" },
  { id: "done", title: "Done", borderColor: "border-emerald-300", headerBg: "bg-emerald-50", headerText: "text-emerald-700" },
];

// ─── Page ───────────────────────────────────────────────────────────────
export default function WorkboardPage() {
  const { isSignedIn } = useAuth();
  const [allTasks, setAllTasks] = useState<{ task: TaskCardRead; board: BoardRead }[]>([]);
  
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const boardsQ = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    undefined, { query: { enabled: Boolean(isSignedIn), staleTime: 60_000 } }
  );
  
  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 100 }, { query: { enabled: Boolean(isSignedIn), staleTime: 60_000 } }
  );

  const boards = useMemo(() => boardsQ.data?.status === 200 ? (boardsQ.data.data.items ?? []) : [], [boardsQ.data]);
  const agents = useMemo(() => agentsQ.data?.status === 200 ? ((agentsQ.data.data.items as unknown as AgentRead[]) ?? []) : [], [agentsQ.data]);
  
  const agentMap = useMemo(() => {
    const map = new Map<string, typeof agents[0]>();
    for (const a of agents) map.set(a.id, a);
    return map;
  }, [agents]);

  // Combine & Filter Tasks
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof allTasks> = {
      todo: [], in_progress: [], review: [], done: []
    };
    
    // Default any unknown status to todo
    allTasks.forEach(item => {
      let status = (item.task.status ?? "todo").toLowerCase();
      if (!groups[status]) status = "todo";
      
      const aId = typeof item.task.assignee === "string" ? item.task.assignee : (item.task.assignee as any)?.id;
      
      // Filters
      if (assigneeFilter !== "all") {
        if (assigneeFilter === "unassigned" && aId) return;
        if (assigneeFilter !== "unassigned" && aId !== assigneeFilter) return;
      }
      
      if (search) {
        if (!item.task.title.toLowerCase().includes(search.toLowerCase())) return;
      }

      groups[status].push(item);
    });

    // Sort by updated_at desc
    for (const key in groups) {
      groups[key].sort((a, b) => {
        const da = a.task.updated_at ? new Date(a.task.updated_at).getTime() : 0;
        const db = b.task.updated_at ? new Date(b.task.updated_at).getTime() : 0;
        return db - da;
      });
    }

    return groups;
  }, [allTasks, assigneeFilter, search]);

  if (!isSignedIn) {
    return <div className="p-8 text-slate-400">Sign in to view workboard.</div>;
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Hidden loaders */}
        {boards.map(b => (
          <BoardTasksLoader
            key={b.id} board={b} signedIn={Boolean(isSignedIn)}
            onTasksLoaded={items => setAllTasks(prev => {
              const keep = prev.filter(x => x.board.id !== b.id);
              return [...keep, ...items];
            })}
          />
        ))}

        {/* Toolbar */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Workboard</h1>
              <p className="text-xs text-slate-500">Cross-board massive Kanban view.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-64 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Bot size={14} className="text-slate-400" />
              <select
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
                className="text-sm border border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Agents</option>
                <option value="unassigned">Unassigned</option>
                <optgroup label="Agents">
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-6 h-full min-w-max items-start">
            {COLUMNS.map(col => {
              const tasks = groupedTasks[col.id] || [];
              return (
                <div key={col.id} className="w-80 flex flex-col max-h-full rounded-xl bg-slate-100/50 border border-slate-200 overflow-hidden shadow-sm">
                  <div className={cn("px-4 py-3 border-b flex items-center justify-between", col.headerBg, col.borderColor)}>
                    <h3 className={cn("font-bold text-sm tracking-wide", col.headerText)}>{col.title}</h3>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white/50", col.headerText)}>{tasks.length}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {tasks.map(({ task, board }) => {
                      const aId = typeof task.assignee === "string" ? task.assignee : (task.assignee as any)?.id;
                      const agent = aId ? agentMap.get(aId) : null;
                      
                      return (
                        <Link 
                          key={task.id} 
                          href={`/boards/${board.id}?taskId=${task.id}`}
                          className="block bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-medium text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                              {task.title}
                            </h4>
                            {task.priority !== undefined && (
                              <span className={cn(
                                "flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                task.priority === "high" ? "bg-rose-100 text-rose-700" :
                                task.priority === "low" ? "bg-slate-100 text-slate-600" :
                                "bg-blue-100 text-blue-700"
                              )}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 max-w-[140px] truncate" title={board.name}>
                              {board.name}
                            </span>
                            
                            {agent ? (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold" title={agent.name}>
                                {agent.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-slate-300 text-slate-400" title="Unassigned">
                                <Bot size={12} />
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    {tasks.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium uppercase tracking-wider">
                        Empty
                      </div>
                    )}
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
