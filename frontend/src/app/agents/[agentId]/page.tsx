"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ChevronRight, FileText, Layers } from "lucide-react";

import { SignInButton, SignedIn, SignedOut, useAuth } from "@/auth/clerk";

import { ApiError } from "@/api/mutator";
import {
  type getAgentApiV1AgentsAgentIdGetResponse,
  useDeleteAgentApiV1AgentsAgentIdDelete,
  useGetAgentApiV1AgentsAgentIdGet,
} from "@/api/generated/agents/agents";
import {
  type listActivityApiV1ActivityGetResponse,
  useListActivityApiV1ActivityGet,
} from "@/api/generated/activity/activity";
import {
  type listBoardsApiV1BoardsGetResponse,
  useListBoardsApiV1BoardsGet,
} from "@/api/generated/boards/boards";
import {
  formatRelativeTimestamp as formatRelative,
  formatTimestamp,
} from "@/lib/formatters";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import type {
  ActivityEventRead,
  AgentRead,
  BoardRead,
} from "@/api/generated/model";
import { Markdown } from "@/components/atoms/Markdown";
import { StatusPill } from "@/components/atoms/StatusPill";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "overview" | "memory" | "activity";

type WorkspaceFiles = {
  ok: boolean;
  agentId: string;
  workspaceDir: string;
  hasContent: boolean;
  files: Record<string, string | null>;
};

const MEMORY_FILE_ORDER = [
  "SOUL.md",
  "IDENTITY.md",
  "MEMORY.md",
  "CURRENT_FOCUS.md",
  "HEARTBEAT.md",
  "TEAM_MEMORY.md",
  "ROSTER.md",
  "AGENTS.md",
];

const FILE_ICONS: Record<string, string> = {
  "SOUL.md": "🧬",
  "IDENTITY.md": "🪪",
  "MEMORY.md": "🧠",
  "CURRENT_FOCUS.md": "🎯",
  "HEARTBEAT.md": "💓",
  "TEAM_MEMORY.md": "👥",
  "ROSTER.md": "📋",
  "AGENTS.md": "🤖",
};

// ─── Memory Browser Sub-Component ────────────────────────────────────────────

function MemoryBrowser({ agentId }: { agentId: string }) {
  const [data, setData] = useState<WorkspaceFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}/workspace-files`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: WorkspaceFiles = await res.json();
      setData(json);
      // Auto-select first available file
      const first = MEMORY_FILE_ORDER.find((f) => json.files[f] !== null);
      if (first) setSelectedFile((prev) => prev ?? first);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const availableFiles = useMemo(
    () => MEMORY_FILE_ORDER.filter((f) => data?.files[f] !== null),
    [data],
  );
  const selectedContent =
    selectedFile && data?.files[selectedFile] ? data.files[selectedFile] : null;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted">
        <span className="animate-pulse">Reading agent workspace…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Failed to load workspace files: {error}
      </div>
    );
  }

  if (!data?.hasContent) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--border)] p-6 text-center">
        <BookOpen size={24} className="text-muted" />
        <p className="text-sm text-muted">No memory files found for this agent.</p>
        <p className="text-xs text-quiet">
          Checked: {data?.workspaceDir ?? "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
      {/* File list sidebar */}
      <div className="w-48 shrink-0 border-r border-[color:var(--border)] bg-[color:var(--surface-muted)]">
        <div className="border-b border-[color:var(--border)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
            Files
          </p>
        </div>
        <ul className="py-2">
          {availableFiles.map((file) => (
            <li key={file}>
              <button
                type="button"
                onClick={() => setSelectedFile(file)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition hover:bg-[color:var(--surface)] ${
                  selectedFile === file
                    ? "bg-[color:var(--surface)] font-semibold text-strong"
                    : "text-muted"
                }`}
              >
                <span>{FILE_ICONS[file] ?? "📄"}</span>
                <span className="truncate">{file}</span>
                {selectedFile === file && (
                  <ChevronRight size={12} className="ml-auto shrink-0 text-quiet" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-[color:var(--border)] px-4 py-2">
          <button
            type="button"
            onClick={fetchFiles}
            className="w-full rounded-md py-1 text-xs text-quiet transition hover:text-muted"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* File content */}
      <div className="min-w-0 flex-1 overflow-auto">
        {selectedContent ? (
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2 border-b border-[color:var(--border)] pb-3">
              <FileText size={14} className="text-quiet" />
              <p className="text-xs font-semibold text-muted">{selectedFile}</p>
            </div>
            <div className="prose prose-sm max-w-none text-sm text-strong">
              <Markdown content={selectedContent} variant="comment" />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted">
            Select a file to view its contents.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Agent Detail Page ───────────────────────────────────────────────────

export default function AgentDetailPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const agentIdParam = params?.agentId;
  const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;

  const { isAdmin } = useOrganizationMembership(isSignedIn);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const agentQuery = useGetAgentApiV1AgentsAgentIdGet<
    getAgentApiV1AgentsAgentIdGetResponse,
    ApiError
  >(agentId ?? "", {
    query: {
      enabled: Boolean(isSignedIn && isAdmin && agentId),
      refetchInterval: 30_000,
      refetchOnMount: "always",
      retry: false,
    },
  });

  const activityQuery = useListActivityApiV1ActivityGet<
    listActivityApiV1ActivityGetResponse,
    ApiError
  >(
    { limit: 200 },
    {
      query: {
        enabled: Boolean(isSignedIn && isAdmin),
        refetchInterval: 30_000,
        retry: false,
      },
    },
  );

  const boardsQuery = useListBoardsApiV1BoardsGet<
    listBoardsApiV1BoardsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin),
      refetchInterval: 60_000,
      refetchOnMount: "always",
      retry: false,
    },
  });

  const agent: AgentRead | null =
    agentQuery.data?.status === 200 ? agentQuery.data.data : null;
  const events = useMemo<ActivityEventRead[]>(() => {
    if (activityQuery.data?.status !== 200) return [];
    return activityQuery.data.data.items ?? [];
  }, [activityQuery.data]);
  const boards = useMemo<BoardRead[]>(() => {
    if (boardsQuery.data?.status !== 200) return [];
    return boardsQuery.data.data.items ?? [];
  }, [boardsQuery.data]);

  const agentEvents = useMemo(() => {
    if (!agent) return [];
    return events.filter((event) => event.agent_id === agent.id);
  }, [events, agent]);
  const linkedBoard =
    !agent?.board_id || agent?.is_gateway_main
      ? null
      : (boards.find((board) => board.id === agent.board_id) ?? null);

  const deleteMutation = useDeleteAgentApiV1AgentsAgentIdDelete<ApiError>({
    mutation: {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/agents");
      },
      onError: (err) => {
        setDeleteError(err.message || "Something went wrong.");
      },
    },
  });

  const isLoading =
    agentQuery.isLoading || activityQuery.isLoading || boardsQuery.isLoading;
  const error =
    agentQuery.error?.message ??
    activityQuery.error?.message ??
    boardsQuery.error?.message ??
    null;

  const isDeleting = deleteMutation.isPending;
  const agentStatus = agent?.status ?? "unknown";

  const handleDelete = () => {
    if (!agentId || !isSignedIn) return;
    setDeleteError(null);
    deleteMutation.mutate({ agentId });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Layers size={13} /> },
    { id: "memory", label: "Memory", icon: <BookOpen size={13} /> },
    { id: "activity", label: `Activity (${agentEvents.length})`, icon: <FileText size={13} /> },
  ];

  return (
    <DashboardShell>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl surface-panel p-10 text-center">
          <p className="text-sm text-muted">Sign in to view agents.</p>
          <SignInButton
            mode="modal"
            forceRedirectUrl="/agents"
            signUpForceRedirectUrl="/agents"
          >
            <Button>Sign in</Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        {!isAdmin ? (
          <div className="flex h-full flex-col gap-6 rounded-2xl surface-panel p-8">
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-5 text-sm text-muted">
              Only organization owners and admins can access agents.
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col gap-6 rounded-2xl surface-panel p-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-quiet">
                  Agents
                </p>
                <h1 className="text-2xl font-semibold text-strong">
                  {agent?.name ?? "Agent"}
                </h1>
                <p className="text-sm text-muted">
                  Review agent health, memory, and activity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/agents")}
                >
                  Back to agents
                </Button>
                {agent ? (
                  <Link
                    href={`/agents/${agent.id}/edit`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:var(--border)] px-4 text-sm font-semibold text-muted transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  >
                    Edit
                  </Link>
                ) : null}
                {agent ? (
                  <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Tabs */}
            {agent && (
              <div className="flex items-center gap-1 border-b border-[color:var(--border)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                        : "border-transparent text-muted hover:text-strong"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {error ? (
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs text-muted">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted">
                Loading agent details…
              </div>
            ) : agent ? (
              <>
                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                  <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Overview
                            </p>
                            <p className="mt-1 text-lg font-semibold text-strong">
                              {agent.name}
                            </p>
                          </div>
                          <StatusPill status={agentStatus} />
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Agent ID
                            </p>
                            <p className="mt-1 text-sm text-muted">{agent.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Session key
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {agent.openclaw_session_id ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Board
                            </p>
                            {agent.is_gateway_main ? (
                              <p className="mt-1 text-sm text-strong">
                                Gateway main (no board)
                              </p>
                            ) : linkedBoard ? (
                              <Link
                                href={`/boards/${linkedBoard.id}`}
                                className="mt-1 inline-flex text-sm font-medium text-[color:var(--accent)] transition hover:underline"
                              >
                                {linkedBoard.name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm text-strong">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Last seen
                            </p>
                            <p className="mt-1 text-sm text-strong">
                              {formatRelative(agent.last_seen_at)}
                            </p>
                            <p className="text-xs text-quiet">
                              {formatTimestamp(agent.last_seen_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Updated
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {formatTimestamp(agent.updated_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                              Created
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {formatTimestamp(agent.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                            Health
                          </p>
                          <StatusPill status={agentStatus} />
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-muted">
                          <div className="flex items-center justify-between">
                            <span>Heartbeat window</span>
                            <span>{formatRelative(agent.last_seen_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Session binding</span>
                            <span>
                              {agent.openclaw_session_id ? "Bound" : "Unbound"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Status</span>
                            <span className="text-strong">{agentStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick activity preview on overview */}
                    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                          Recent Activity
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("activity")}
                          className="text-xs text-[color:var(--accent)] transition hover:underline"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="space-y-3">
                        {agentEvents.slice(0, 5).length === 0 ? (
                          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-muted">
                            No activity yet for this agent.
                          </div>
                        ) : (
                          agentEvents.slice(0, 5).map((event) => (
                            <div
                              key={event.id}
                              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm text-muted"
                            >
                              {event.message?.trim() ? (
                                <div className="select-text cursor-text leading-relaxed text-strong break-words line-clamp-2">
                                  <Markdown
                                    content={event.message}
                                    variant="comment"
                                  />
                                </div>
                              ) : (
                                <p className="font-medium text-strong">
                                  {event.event_type}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-quiet">
                                {formatTimestamp(event.created_at)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MEMORY TAB ── */}
                {activeTab === "memory" && agentId && (
                  <MemoryBrowser agentId={agentId} />
                )}

                {/* ── ACTIVITY TAB ── */}
                {activeTab === "activity" && (
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-quiet">
                        Activity
                      </p>
                      <p className="text-xs text-quiet">
                        {agentEvents.length} events
                      </p>
                    </div>
                    <div className="space-y-3">
                      {agentEvents.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-muted">
                          No activity yet for this agent.
                        </div>
                      ) : (
                        agentEvents.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-muted"
                          >
                            {event.message?.trim() ? (
                              <div className="select-text cursor-text leading-relaxed text-strong break-words">
                                <Markdown
                                  content={event.message}
                                  variant="comment"
                                />
                              </div>
                            ) : (
                              <p className="font-medium text-strong">
                                {event.event_type}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-quiet">
                              {formatTimestamp(event.created_at)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted">
                Agent not found.
              </div>
            )}
          </div>
        )}
      </SignedIn>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent aria-label="Delete agent">
          <DialogHeader>
            <DialogTitle>Delete agent</DialogTitle>
            <DialogDescription>
              This will remove {agent?.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs text-muted">
              {deleteError}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
