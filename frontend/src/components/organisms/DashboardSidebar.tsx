"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  Folder,
  FolderGit2,
  Building2,
  GitBranch,
  Inbox,
  LayoutGrid,
  Moon,
  Sun,
  Timer,
} from "lucide-react";

import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import {
  type healthzHealthzGetResponse,
  useHealthzHealthzGet,
} from "@/api/generated/default/default";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { isAdmin } = useOrganizationMembership(isSignedIn);
  const healthQuery = useHealthzHealthzGet<healthzHealthzGetResponse, ApiError>({
    query: { refetchInterval: 30_000, refetchOnMount: "always", retry: false },
    request: { cache: "no-store" },
  });

  // ─── Dark mode toggle ──────────────────────────────────────────────────────
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try { setDark(localStorage.getItem("mc-sidebar-dark") === "1"); } catch {}
  }, []);
  const toggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d;
      try { localStorage.setItem("mc-sidebar-dark", next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  // ─── System health ─────────────────────────────────────────────────────────
  const okValue = healthQuery.data?.data?.ok;
  const systemStatus: "unknown" | "operational" | "degraded" =
    okValue === true ? "operational"
    : okValue === false ? "degraded"
    : healthQuery.isError ? "degraded"
    : "unknown";
  const statusLabel =
    systemStatus === "operational" ? "All systems operational"
    : systemStatus === "unknown" ? "System status unavailable"
    : "System degraded";

  // ─── Style helpers ─────────────────────────────────────────────────────────
  const D = dark;
  const sidebarCls = D
    ? "flex h-full w-64 flex-col border-r border-slate-700 bg-slate-900"
    : "flex h-full w-64 flex-col border-r border-slate-200 bg-white";
  const sectionLabelCls = D
    ? "px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
    : "px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400";
  const linkBase = D
    ? "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition"
    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition";
  const linkActive = D ? "bg-slate-700 text-white font-medium" : "bg-blue-100 text-blue-800 font-medium";
  const linkHover = D ? "hover:bg-slate-800" : "hover:bg-slate-100";
  const inboxActive = D ? "bg-amber-900 text-amber-200 font-medium" : "bg-amber-100 text-amber-800 font-medium";
  const footerCls = D ? "border-t border-slate-700 p-4" : "border-t border-slate-200 p-4";
  const footerTextCls = D ? "flex items-center gap-2 text-xs text-slate-400" : "flex items-center gap-2 text-xs text-slate-500";
  const topLabelCls = D
    ? "px-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
    : "px-3 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <aside className={sidebarCls}>
      {/* Header row with label + dark toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-transparent">
        <p className={topLabelCls}>Navigation</p>
        <button
          onClick={toggleDark}
          className={cn(
            "flex items-center justify-center rounded-lg p-1.5 transition",
            D ? "text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"
          )}
          aria-label="Toggle dark sidebar"
          title={D ? "Switch to light sidebar" : "Switch to dark sidebar"}
        >
          {D ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <nav className="space-y-4 text-sm">

          {/* Overview */}
          <div>
            <p className={sectionLabelCls}>Overview</p>
            <div className="mt-1 space-y-1">
              <Link href="/dashboard" className={cn(linkBase, pathname === "/dashboard" ? linkActive : linkHover)}>
                <BarChart3 className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/inbox" className={cn(linkBase, pathname === "/inbox" ? inboxActive : linkHover)}>
                <Inbox className="h-4 w-4" />
                <span className="flex-1">Inbox</span>
              </Link>
              <Link href="/projects" className={cn(linkBase, pathname.startsWith("/projects") ? (D ? "bg-indigo-800 text-white font-medium" : "bg-indigo-100 text-indigo-800 font-medium") : linkHover)}>
                <FolderGit2 className="h-4 w-4" /> Projects
              </Link>
              <Link href="/activity" className={cn(linkBase, pathname.startsWith("/activity") ? linkActive : linkHover)}>
                <Activity className="h-4 w-4" /> Live feed
              </Link>
            </div>
          </div>

          {/* Boards */}
          <div>
            <p className={sectionLabelCls}>Boards</p>
            <div className="mt-1 space-y-1">
              <Link href="/board-groups" className={cn(linkBase, pathname.startsWith("/board-groups") ? linkActive : linkHover)}>
                <Folder className="h-4 w-4" /> Board groups
              </Link>
              <Link href="/boards" className={cn(linkBase, pathname.startsWith("/boards") ? linkActive : linkHover)}>
                <LayoutGrid className="h-4 w-4" /> Boards
              </Link>
              <Link href="/approvals" className={cn(linkBase, pathname.startsWith("/approvals") ? linkActive : linkHover)}>
                <CheckCircle2 className="h-4 w-4" /> Approvals
              </Link>
            </div>
          </div>

          {/* Administration */}
          <div>
            <p className={sectionLabelCls}>Administration</p>
            <div className="mt-1 space-y-1">
              <Link href="/org-tree" className={cn(linkBase, pathname.startsWith("/org-tree") ? linkActive : linkHover)}>
                <GitBranch className="h-4 w-4" /> Org Tree
              </Link>
              <Link href="/virtual-office" className={cn(linkBase, pathname.startsWith("/virtual-office") ? (D ? "bg-violet-900 text-violet-200 font-medium" : "bg-violet-100 text-violet-800 font-medium") : linkHover)}>
                <Building2 className="h-4 w-4" /> Virtual Office
              </Link>
              <Link href="/scheduled" className={cn(linkBase, pathname.startsWith("/scheduled") ? linkActive : linkHover)}>
                <Timer className="h-4 w-4" /> Scheduled
              </Link>
              {isAdmin ? (
                <Link href="/agents" className={cn(linkBase, pathname.startsWith("/agents") ? linkActive : linkHover)}>
                  <Bot className="h-4 w-4" /> Agents
                </Link>
              ) : null}
            </div>
          </div>

        </nav>
      </div>

      {/* Footer */}
      <div className={footerCls}>
        <div className={footerTextCls}>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              systemStatus === "operational" && "bg-emerald-500",
              systemStatus === "degraded" && "bg-rose-500",
              systemStatus === "unknown" && "bg-slate-300",
            )}
          />
          {statusLabel}
        </div>
      </div>
    </aside>
  );
}
