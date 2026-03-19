"use client";

import { useMemo } from "react";
import { Activity, Zap } from "lucide-react";
import {
  useListBoardsApiV1BoardsGet,
  type listBoardsApiV1BoardsGetResponse,
} from "@/api/generated/boards/boards";
import {
  useListActivityApiV1ActivityGet,
  type listActivityApiV1ActivityGetResponse,
} from "@/api/generated/activity/activity";
import { formatRelativeTimestamp } from "@/lib/formatters";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import type { ActivityEventRead } from "@/api/generated/model";

const EVENT_STYLE: Record<string, { icon: string; color: string; border: string; label: string }> = {
  "task.status_changed": { icon: "⚡", color: "text-violet-700 bg-violet-50", border: "border-violet-300", label: "Status Change" },
  "task.created":        { icon: "📌", color: "text-blue-700 bg-blue-50",   border: "border-blue-300",   label: "Task Created" },
  "task.updated":        { icon: "✏️", color: "text-slate-700 bg-slate-50", border: "border-slate-300",  label: "Updated" },
  "agent.heartbeat":     { icon: "💓", color: "text-emerald-700 bg-emerald-50", border: "border-emerald-300", label: "Heartbeat" },
  "agent.turn.start":    { icon: "🚀", color: "text-amber-700 bg-amber-50",  border: "border-amber-300",  label: "Agent Turn" },
  "agent.turn.end":      { icon: "✅", color: "text-green-700 bg-green-50",  border: "border-green-300",  label: "Turn Done" },
  "task.comment":        { icon: "💬", color: "text-indigo-700 bg-indigo-50", border: "border-indigo-300", label: "Comment" },
};

function getStyle(event: ActivityEventRead) {
  return EVENT_STYLE[event.event_type ?? ""] ?? {
    icon: "•",
    color: "text-slate-600 bg-slate-50",
    border: "border-slate-200",
    label: event.event_type ?? "Event",
  };
}

export function SwarmActivityFeed() {
  const { isSignedIn } = useAuth();

  const activityQuery = useListActivityApiV1ActivityGet<listActivityApiV1ActivityGetResponse, ApiError>(
    { limit: 30 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 15_000,
        refetchOnMount: "always",
      },
    }
  );

  const events = useMemo(() => {
    if (activityQuery.data?.status !== 200) return [];
    const items = activityQuery.data.data.items ?? [];
    // Filter out pure heartbeats unless the feed would be empty
    const meaningful = items.filter(
      (e) => e.event_type !== "agent.heartbeat"
    );
    return (meaningful.length > 0 ? meaningful : items).slice(0, 20);
  }, [activityQuery.data]);

  const isLoading = activityQuery.isLoading;

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
          <div className="px-4 py-8 text-center">
            <Activity className="mx-auto h-6 w-6 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        )}
        {events.map((event) => {
          const style = getStyle(event);
          return (
            <div
              key={event.id}
              className={`px-3 py-2.5 flex items-start gap-2.5 border-l-2 ${style.border}`}
            >
              <span className="text-base mt-0.5 shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  <span className={`rounded px-1 ${style.color}`}>{style.label}</span>
                  <span className="ml-auto font-normal normal-case text-slate-400">
                    {event.created_at ? formatRelativeTimestamp(event.created_at) : ""}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {event.message ?? event.event_type ?? "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
