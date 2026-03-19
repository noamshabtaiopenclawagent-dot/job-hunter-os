"use client";

export const dynamic = "force-dynamic";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Crown,
  ExternalLink,
  GitBranch,
  Inbox,
  Loader2,
  Shield,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { ApiError } from "@/api/mutator";
import {
  type listAgentsApiV1AgentsGetResponse,
  useListAgentsApiV1AgentsGet,
} from "@/api/generated/agents/agents";
import {
  useListTasksApiV1BoardsBoardIdTasksGet,
} from "@/api/generated/tasks/tasks";
import { formatRelativeTimestamp } from "@/lib/formatters";
import {
  ORG_TREE,
  SWARM_LINKS,
  flattenTree,
  type OrgTreeNode,
  type AgentTier,
} from "@/lib/org-tree";
import type { AgentRead, TaskRead } from "@/api/generated/model";

/* ── Tier styling ────────────────────────────────────────────────── */
const TIER_CONFIG: Record<
  AgentTier,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  root: {
    label: "Primary",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: <Crown className="h-3.5 w-3.5" />,
  },
  sub: {
    label: "Core",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  supporting: {
    label: "Support",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-300",
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  system: {
    label: "System",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-300",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
};

const STATUS_TASK_COLOR: Record<string, string> = {
  in_progress: "text-blue-600 bg-blue-50 border-blue-200",
  inbox:       "text-slate-500 bg-slate-50 border-slate-200",
  todo:        "text-amber-600 bg-amber-50 border-amber-200",
  done:        "text-emerald-600 bg-emerald-50 border-emerald-200",
};

/* ── Agent Card ──────────────────────────────────────────────────── */
function AgentCard({
  node,
  liveAgent,
  activeTask,
  inboxCount,
}: {
  node: OrgTreeNode;
  liveAgent?: AgentRead | null;
  activeTask?: TaskRead | null;
  inboxCount?: number;
}) {
  const tier = TIER_CONFIG[node.tier];
  const status = (liveAgent?.status ?? "offline").toLowerCase();
  const isOnline = status === "online";
  const lastSeen = liveAgent?.last_seen_at || liveAgent?.updated_at;
  const hasSwarmLink = SWARM_LINKS.some((l) => l.from === node.id || l.to === node.id);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-white shadow-md transition hover:shadow-xl hover:-translate-y-0.5 ${tier.border} ${node.tier === "root" ? "shadow-amber-100" : ""}`}
      style={{ minWidth: 220 }}
    >
      {/* online indicator bar */}
      <div
        className={`absolute left-0 top-0 h-1 w-full transition-all ${
          isOnline ? "bg-emerald-500" : "bg-slate-200"
        }`}
      />

      <div className="p-4 pt-5">
        {/* avatar + name */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl select-none ${tier.bg}`}
          >
            {node.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-sm">{node.name}</h4>
              {hasSwarmLink && (
                <span title="Swarm delegation active">
                  <GitBranch className="h-3 w-3 text-violet-400" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">{node.role}</p>
          </div>
          {/* status dot */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              isOnline
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isOnline && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
            {status}
          </span>
        </div>

        {/* active task */}
        {activeTask ? (
          (() => {
            const isStale =
              new Date().getTime() - new Date(activeTask.updated_at).getTime() >
              15 * 60 * 1000;
            return (
              <div
                className={`mt-2 rounded-lg border px-2.5 py-1.5 text-[11px] leading-tight ${
                  isStale
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : STATUS_TASK_COLOR[activeTask.status ?? "inbox"] ??
                      STATUS_TASK_COLOR.inbox
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {!isStale ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Circle className="h-2.5 w-2.5" />
                  )}
                  <span className="font-semibold uppercase tracking-wide text-[9px]">
                    {isStale ? "Stalled" : "Active"}
                  </span>
                </div>
                <p className="truncate font-medium" title={activeTask.title}>
                  {activeTask.title}
                </p>
              </div>
            );
          })()
        ) : (
          <div className="mt-2 rounded-lg border border-dashed border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Circle className="h-2.5 w-2.5" />
            <span>No active task</span>
          </div>
        )}

        {/* footer: model + inbox count + link */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${tier.bg} ${tier.color} font-medium`}>
              {tier.icon}
              {tier.label}
            </span>
            {(inboxCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 font-semibold">
                <Inbox className="h-2.5 w-2.5" />
                {inboxCount}
              </span>
            )}
          </div>
          {liveAgent ? (
            <Link
              href={`/agents/${liveAgent.id}`}
              className="inline-flex items-center gap-0.5 hover:text-slate-700 transition"
            >
              Logs
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          ) : (
            <span>{lastSeen ? formatRelativeTimestamp(lastSeen) : "Never seen"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Swarm Link Badge ────────────────────────────────────────────── */
function SwarmLinkBadge({ from, to, label }: { from: string; to: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] text-violet-700 font-medium">
      <span className="uppercase font-bold">{from}</span>
      <ArrowRight className="h-3 w-3" />
      <span className="uppercase font-bold">{to}</span>
      <span className="text-violet-400 font-normal">· {label}</span>
    </div>
  );
}

/* ── Board Tasks Hook  ───────────────────────────────────────────── */
function useBoardTasks(boardId?: string, enabled?: boolean) {
  return useListTasksApiV1BoardsBoardIdTasksGet(
    boardId ?? "",
    { status: "in_progress", limit: 1 },
    { query: { enabled: !!boardId && !!enabled, refetchInterval: 15_000 } },
  );
}

function useBoardInbox(boardId?: string, enabled?: boolean) {
  return useListTasksApiV1BoardsBoardIdTasksGet(
    boardId ?? "",
    { status: "inbox", limit: 100 },
    { query: { enabled: !!boardId && !!enabled, refetchInterval: 30_000 } },
  );
}

/* ── Hydrated Agent Card (fetches its own tasks) ─────────────────── */
function HydratedAgentCard({
  node,
  agentMap,
  isSignedIn,
}: {
  node: OrgTreeNode;
  agentMap: Map<string, AgentRead>;
  isSignedIn: boolean;
}) {
  const liveAgent = agentMap.get(node.id) ?? agentMap.get(node.name.toLowerCase()) ?? null;
  const tasksQuery = useBoardTasks(node.boardId, isSignedIn);
  const inboxQuery = useBoardInbox(node.boardId, isSignedIn);

  const activeTask =
    tasksQuery.data?.status === 200
      ? (tasksQuery.data.data.items?.[0] ?? null)
      : null;

  const inboxCount =
    inboxQuery.data?.status === 200
      ? (inboxQuery.data.data.total ?? 0)
      : 0;

  return (
    <AgentCard
      node={node}
      liveAgent={liveAgent}
      activeTask={activeTask}
      inboxCount={inboxCount}
    />
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function OrgTreePage() {
  const { isSignedIn } = useAuth();

  const agentsQuery = useListAgentsApiV1AgentsGet<
    listAgentsApiV1AgentsGetResponse,
    ApiError
  >(
    { limit: 200 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 15_000,
        refetchOnMount: "always",
      },
    },
  );

  const agentMap = useMemo(() => {
    const map = new Map<string, AgentRead>();
    if (agentsQuery.data?.status === 200) {
      for (const agent of agentsQuery.data.data.items ?? []) {
        map.set(agent.id, agent);
        map.set(agent.name.toLowerCase(), agent);
      }
    }
    return map;
  }, [agentsQuery.data]);

  const allNodes = flattenTree(ORG_TREE);
  const onlineCount = useMemo(() => {
    if (agentsQuery.data?.status !== 200) return 0;
    return (agentsQuery.data.data.items ?? []).filter(
      (a) => (a.status ?? "").toLowerCase() === "online",
    ).length;
  }, [agentsQuery.data]);

  const rootNode = ORG_TREE;
  const subNodes = ORG_TREE.children?.filter((c) => c.tier === "sub") ?? [];
  const supportNodes = ORG_TREE.children?.filter((c) => c.tier === "supporting") ?? [];
  const systemNodes = ORG_TREE.children?.filter((c) => c.tier === "system") ?? [];

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel
          message="Sign in to view the organizational tree."
          forceRedirectUrl="/onboarding"
          signUpForceRedirectUrl="/onboarding"
        />
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white">
            <div className="px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
                    Agent Organization
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Live hierarchy · active tasks · swarm delegation flow
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {allNodes.length} Agents
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {onlineCount} Online
                  </span>
                  <Link
                    href="/virtual-office"
                    className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 shadow-sm hover:bg-violet-100 transition"
                  >
                    🖥️ Virtual Office
                  </Link>
                </div>
              </div>

              {/* Swarm Links Banner */}
              <div className="mt-3 flex flex-wrap gap-2">
                {SWARM_LINKS.map((l) => (
                  <SwarmLinkBadge key={`${l.from}-${l.to}`} {...l} />
                ))}
              </div>
            </div>
          </div>

          {/* Tree */}
          <div className="p-8 space-y-10">
            {/* Tier 0 — Root */}
            <div className="flex justify-center">
              <div className="w-64">
                <HydratedAgentCard
                  node={rootNode}
                  agentMap={agentMap}
                  isSignedIn={!!isSignedIn}
                />
              </div>
            </div>

            {/* vertical connector */}
            <div className="flex justify-center">
              <div className="h-6 w-px bg-slate-300" />
            </div>

            {/* Tier 1 — Sub agents (Bob, Alex) */}
            {subNodes.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                    <Zap className="h-3 w-3" />
                    Core Agents
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {subNodes.map((node) => (
                    <div key={node.id} className="w-64">
                      <HydratedAgentCard
                        node={node}
                        agentMap={agentMap}
                        isSignedIn={!!isSignedIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tier 2 — Supporting */}
            {supportNodes.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200">
                    <Wrench className="h-3 w-3" />
                    Supporting Agents
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {supportNodes.map((node) => (
                    <div key={node.id} className="w-60">
                      <HydratedAgentCard
                        node={node}
                        agentMap={agentMap}
                        isSignedIn={!!isSignedIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tier 3 — System */}
            {systemNodes.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-300">
                    <Shield className="h-3 w-3" />
                    System Agents
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {systemNodes.map((node) => (
                    <div key={node.id} className="w-60">
                      <HydratedAgentCard
                        node={node}
                        agentMap={agentMap}
                        isSignedIn={!!isSignedIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
