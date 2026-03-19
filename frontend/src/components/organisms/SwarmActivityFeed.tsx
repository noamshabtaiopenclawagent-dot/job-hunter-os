"use client";

import { useMemo } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useListTasksApiV1BoardsBoardIdTasksGet } from "@/api/generated/tasks/tasks";
import { formatRelativeTimestamp } from "@/lib/formatters";
import type { TaskRead } from "@/api/generated/model";
import { useAuth } from "@/auth/clerk";

const BOARD_IDS = [
  "278627d8-606a-4935-bd8f-9293ffcfabc7", // alex
  "24a91d03-2211-4376-92d6-7e2f7251e51a",  // bob
  "4ec8efd0-17c5-4c3d-91b8-dcff44ba021f",  // mc
];

const SWARM_PREFIXES = ["[CODE-REVIEW]", "[SWARM-", "[DEBT-", "[REVIEW]"];

function isSwarmEvent(task: TaskRead): boolean {
  return SWARM_PREFIXES.some((p) => (task.title ?? "").startsWith(p));
}

function eventLabel(task: TaskRead): { from: string; to: string; title: string; color: string; icon: string } {
  const title = task.title ?? "";
  if (title.startsWith("[CODE-REVIEW]") || title.startsWith("[REVIEW]"))
    return { from: "BOB", to: "ALEX", title: title.replace(/^\[[\w-]+\]\s*/, ""), color: "text-amber-700 bg-amber-50 border-amber-200", icon: "🔬" };
  if (title.startsWith("[DEBT-"))
    return { from: "GATE", to: "BOB", title: title.replace(/^\[[\w-]+\]\s*/, ""), color: "text-orange-700 bg-orange-50 border-orange-200", icon: "🔧" };
  if (title.startsWith("[SWARM-"))
    return { from: "OPI", to: "BOB", title: title.replace(/^\[[\w-]+\]\s*/, ""), color: "text-violet-700 bg-violet-50 border-violet-200", icon: "⚡" };
  return { from: "OPI", to: "BOB", title, color: "text-blue-700 bg-blue-50 border-blue-200", icon: "📌" };
}

function BoardFeed({ boardId }: { boardId: string }) {
  return useListTasksApiV1BoardsBoardIdTasksGet(
    boardId,
    { limit: 20 },
    { query: { enabled: true, refetchInterval: 15_000 } },
  );
}

export function SwarmActivityFeed() {
  const { isSignedIn } = useAuth();

  const alexQuery = useListTasksApiV1BoardsBoardIdTasksGet(
    BOARD_IDS[0],
    { limit: 50 },
    { query: { enabled: !!isSignedIn, refetchInterval: 15_000 } },
  );
  const bobQuery = useListTasksApiV1BoardsBoardIdTasksGet(
    BOARD_IDS[1],
    { limit: 50 },
    { query: { enabled: !!isSignedIn, refetchInterval: 15_000 } },
  );
  const mcQuery = useListTasksApiV1BoardsBoardIdTasksGet(
    BOARD_IDS[2],
    { limit: 50 },
    { query: { enabled: !!isSignedIn, refetchInterval: 15_000 } },
  );

  const events = useMemo(() => {
    const all: TaskRead[] = [];
    for (const q of [alexQuery, bobQuery, mcQuery]) {
      if (q.data?.status === 200) {
        all.push(...(q.data.data.items ?? []).filter(isSwarmEvent));
      }
    }
    return all
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 20);
  }, [alexQuery.data, bobQuery.data, mcQuery.data]);

  const isLoading = alexQuery.isLoading || bobQuery.isLoading || mcQuery.isLoading;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ minWidth: 280 }}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Zap className="h-4 w-4 text-violet-500" />
        <span className="font-semibold text-sm text-slate-800">Swarm Activity</span>
        <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
          </span>
          Live
        </span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: 480 }}>
        {isLoading && (
          <div className="px-4 py-6 text-center text-sm text-slate-400 animate-pulse">Loading events…</div>
        )}
        {!isLoading && events.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">No swarm events yet</div>
        )}
        {events.map((task) => {
          const ev = eventLabel(task);
          return (
            <div key={task.id} className={`px-3 py-2.5 flex items-start gap-2.5 border-l-2 ${ev.color.includes("amber") ? "border-amber-300" : ev.color.includes("orange") ? "border-orange-300" : ev.color.includes("violet") ? "border-violet-300" : "border-blue-300"}`}>
              <span className="text-base mt-0.5 shrink-0">{ev.icon}</span>
              <div className="min-w-0 flex-1">
                {/* from → to */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  <span>{ev.from}</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                  <span>{ev.to}</span>
                  <span className="ml-auto font-normal normal-case text-slate-400">
                    {task.created_at ? formatRelativeTimestamp(task.created_at) : ""}
                  </span>
                </div>
                <p className={`text-[11px] font-medium truncate rounded px-1.5 py-0.5 border ${ev.color}`}>
                  {ev.title || task.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
