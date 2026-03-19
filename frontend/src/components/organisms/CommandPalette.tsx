"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  LayoutGrid,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import {
  useListAgentsApiV1AgentsGet,
  type listAgentsApiV1AgentsGetResponse,
} from "@/api/generated/agents/agents";
import {
  useListBoardsApiV1BoardsGet,
  type listBoardsApiV1BoardsGetResponse,
} from "@/api/generated/boards/boards";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type ResultKind = "board" | "agent" | "page";

type PaletteResult = {
  id: string;
  kind: ResultKind;
  icon: React.ReactNode;
  label: string;
  sub?: string;
  href?: string;
  action?: () => void;
};

const PAGES: PaletteResult[] = [
  { id: "p-dashboard",    kind: "page", icon: <LayoutGrid size={14} />, label: "Dashboard",      href: "/dashboard" },
  { id: "p-inbox",        kind: "page", icon: <LayoutGrid size={14} />, label: "Inbox",           href: "/inbox" },
  { id: "p-boards",       kind: "page", icon: <LayoutGrid size={14} />, label: "Boards",          href: "/boards" },
  { id: "p-activity",     kind: "page", icon: <LayoutGrid size={14} />, label: "Activity",        href: "/activity" },
  { id: "p-projects",     kind: "page", icon: <LayoutGrid size={14} />, label: "Projects",        href: "/projects" },
  { id: "p-voffice",      kind: "page", icon: <LayoutGrid size={14} />, label: "Virtual Office",  href: "/virtual-office" },
  { id: "p-org-tree",     kind: "page", icon: <LayoutGrid size={14} />, label: "Org Tree",        href: "/org-tree" },
  { id: "p-scheduled",    kind: "page", icon: <LayoutGrid size={14} />, label: "Scheduled",       href: "/scheduled" },
  { id: "p-approvals",    kind: "page", icon: <LayoutGrid size={14} />, label: "Approvals",       href: "/approvals" },
];

const KIND_LABEL: Record<ResultKind, string> = {
  board: "Board",
  agent: "Agent",
  page: "Page",
};

const KIND_COLOR: Record<ResultKind, string> = {
  board: "bg-blue-50 text-blue-600 border-blue-100",
  agent: "bg-violet-50 text-violet-600 border-violet-100",
  page:  "bg-slate-50 text-slate-500 border-slate-200",
};

// ─── Command Palette Component ────────────────────────────────────────────────
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const boardsQ = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    undefined,
    { query: { enabled: Boolean(isSignedIn), staleTime: 30_000 } }
  );

  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 },
    { query: { enabled: Boolean(isSignedIn), staleTime: 30_000 } }
  );

  const allResults = useMemo((): PaletteResult[] => {
    const boards: PaletteResult[] = (boardsQ.data?.status === 200
      ? boardsQ.data.data.items ?? []
      : []
    ).map(b => ({
      id: `board-${b.id}`,
      kind: "board" as const,
      icon: <LayoutGrid size={14} />,
      label: b.name,
      sub: b.description ?? undefined,
      href: `/boards/${b.id}`,
    }));

    const agents: PaletteResult[] = (agentsQ.data?.status === 200
      ? agentsQ.data.data.items ?? []
      : []
    ).map(a => ({
      id: `agent-${a.id}`,
      kind: "agent" as const,
      icon: <Bot size={14} />,
      label: a.name,
      sub: (a as unknown as { identity_profile?: { role?: string } }).identity_profile?.role,
      href: `/virtual-office`,
    }));

    return [...PAGES, ...boards, ...agents];
  }, [boardsQ.data, agentsQ.data]);

  const results = useMemo(() => {
    if (!query.trim()) return allResults.slice(0, 8);
    const q = query.toLowerCase();
    return allResults
      .filter(r => r.label.toLowerCase().includes(q) || (r.sub ?? "").toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, allResults]);

  useEffect(() => { setActiveIdx(0); }, [results]);

  const navigate = useCallback((result: PaletteResult) => {
    if (result.action) { result.action(); }
    else if (result.href) { router.push(result.href); }
    onClose();
  }, [router, onClose]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); if (results[activeIdx]) navigate(results[activeIdx]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [results, activeIdx, navigate, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, boards, agents…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-900 bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
          <kbd className="shrink-0 text-[10px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto py-1">
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">No results found</p>
          )}
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => navigate(r)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                i === activeIdx ? "bg-blue-50" : "hover:bg-slate-50"
              )}
            >
              <span className="shrink-0 text-slate-400">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{r.label}</p>
                {r.sub && <p className="text-[11px] text-slate-400 truncate">{r.sub}</p>}
              </div>
              <span className={cn(
                "shrink-0 text-[9px] font-bold uppercase rounded border px-1.5 py-0.5",
                KIND_COLOR[r.kind]
              )}>
                {KIND_LABEL[r.kind]}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-3 text-[10px] text-slate-400">
          <span><kbd className="font-mono bg-slate-100 rounded px-1 py-0.5">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-slate-100 rounded px-1 py-0.5">↵</kbd> open</span>
          <span><kbd className="font-mono bg-slate-100 rounded px-1 py-0.5">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
