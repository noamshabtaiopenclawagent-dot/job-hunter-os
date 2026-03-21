"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCommit, FolderGit2, Users, CheckCircle2, Clock, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";

const MC_API = "http://127.0.0.1:8000/api/v1";
const GITHUB_REPOS = [
  { name: "Job Hunter OS", repo: "noamshabtaiopenclawagent-dot/job-hunter-os", board: "Job Hunter OS", owner: "BOB", reviewer: "OPI" },
  { name: "Mission Control", repo: "noamshabtaiopenclawagent-dot/openclaw-mission-control", board: "Autonomous Mission Control", owner: "OPI", reviewer: "OPI" },
];

type CommitInfo = { sha: string; message: string; author: string; date: string; url: string };
type BoardCounts = { inbox: number; in_progress: number; review: number; done: number; total: number };
type ProjectHealth = "healthy" | "active" | "stagnant" | "blocked" | "unknown";

type Project = {
  name: string;
  repo: string;
  githubUrl: string;
  board: string;
  owner: string;
  reviewer: string;
  counts: BoardCounts;
  latestCommit: CommitInfo | null;
  commitsWeek: number;
  health: ProjectHealth;
  loaded: boolean;
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function calcHealth(counts: BoardCounts, commitsWeek: number, latestCommit: CommitInfo | null): ProjectHealth {
  if (!latestCommit) return "unknown";
  const daysSinceCommit = latestCommit ? Math.floor((Date.now() - new Date(latestCommit.date).getTime()) / 86400000) : 99;
  if (daysSinceCommit > 7 && commitsWeek === 0) return "stagnant";
  if (counts.in_progress > 20) return "blocked";
  if (commitsWeek >= 3) return "healthy";
  return "active";
}

const HEALTH_STYLE: Record<ProjectHealth, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  healthy:  { label: "Healthy",  color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 size={12} /> },
  active:   { label: "Active",   color: "text-amber-700",   bg: "bg-amber-100",   icon: <Clock size={12} /> },
  stagnant: { label: "Stagnant", color: "text-rose-700",    bg: "bg-rose-100",    icon: <AlertTriangle size={12} /> },
  blocked:  { label: "Blocked",  color: "text-red-700",     bg: "bg-red-100",     icon: <AlertTriangle size={12} /> },
  unknown:  { label: "Unknown",  color: "text-slate-500",   bg: "bg-slate-100",   icon: <Clock size={12} /> },
};

function CountPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${tone}`}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

async function fetchBoardCounts(boardName: string): Promise<BoardCounts> {
  try {
    const br = await fetch(`${MC_API}/boards?limit=100`, { cache: "no-store" });
    const bd = await br.json();
    const boards: { id: string; name: string }[] = bd.items ?? bd;
    const board = boards.find((b) => b.name === boardName);
    if (!board) return { inbox: 0, in_progress: 0, review: 0, done: 0, total: 0 };
    const tr = await fetch(`${MC_API}/boards/${board.id}/tasks?limit=200`, { cache: "no-store" });
    const td = await tr.json();
    const tasks: { status: string }[] = td.items ?? td;
    const counts = tasks.reduce(
      (a, t) => { const s = t.status as keyof typeof a; if (s in a) a[s]++; a.total++; return a; },
      { inbox: 0, in_progress: 0, review: 0, done: 0, total: 0 }
    );
    return counts;
  } catch { return { inbox: 0, in_progress: 0, review: 0, done: 0, total: 0 }; }
}

async function fetchGitHub(repo: string): Promise<{ latestCommit: CommitInfo | null; commitsWeek: number }> {
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=30`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!r.ok) return { latestCommit: null, commitsWeek: 0 };
    const commits = await r.json();
    if (!commits.length) return { latestCommit: null, commitsWeek: 0 };
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const commitsWeek = commits.filter(
      (c: { commit: { author: { date: string } } }) =>
        new Date(c.commit.author.date).getTime() > sevenDaysAgo
    ).length;
    const c = commits[0];
    return {
      latestCommit: {
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split("\n")[0].slice(0, 80),
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url,
      },
      commitsWeek,
    };
  } catch { return { latestCommit: null, commitsWeek: 0 }; }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(
    GITHUB_REPOS.map((p) => ({
      ...p,
      githubUrl: `https://github.com/${p.repo}`,
      counts: { inbox: 0, in_progress: 0, review: 0, done: 0, total: 0 },
      latestCommit: null,
      commitsWeek: 0,
      health: "unknown" as ProjectHealth,
      loaded: false,
    }))
  );
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const updated = await Promise.all(
      GITHUB_REPOS.map(async (p) => {
        const [counts, ghData] = await Promise.all([
          fetchBoardCounts(p.board),
          fetchGitHub(p.repo),
        ]);
        return {
          ...p,
          githubUrl: `https://github.com/${p.repo}`,
          counts,
          latestCommit: ghData.latestCommit,
          commitsWeek: ghData.commitsWeek,
          health: calcHealth(counts, ghData.commitsWeek, ghData.latestCommit),
          loaded: true,
        };
      })
    );
    setProjects(updated);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel message="Sign in to view projects." forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding" />
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 size={18} className="text-indigo-500" />
              <h1 className="font-semibold text-slate-800">Projects</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {projects.length}
              </span>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="p-6 space-y-6">
            {projects.map((p) => {
              const h = HEALTH_STYLE[p.health];
              return (
                <section
                  key={p.name}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FolderGit2 size={18} className="text-indigo-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-slate-800">{p.name}</h2>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${h.bg} ${h.color}`}>
                            {h.icon} {h.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Owner: <strong className="text-slate-600">{p.owner}</strong>
                          {" · "}Review: <strong className="text-slate-600">{p.reviewer}</strong>
                        </div>
                      </div>
                    </div>
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    >
                      <ExternalLink size={11} />
                      GitHub
                    </a>
                  </div>

                  {/* Board counts */}
                  <div className="grid grid-cols-5 gap-0 border-b border-slate-100 divide-x divide-slate-100 px-0">
                    {[
                      { label: "Inbox",       value: p.counts.inbox,       tone: "text-slate-600" },
                      { label: "In Progress", value: p.counts.in_progress, tone: p.counts.in_progress > 10 ? "text-amber-600" : "text-slate-600" },
                      { label: "Review",      value: p.counts.review,      tone: "text-violet-600" },
                      { label: "Done",        value: p.counts.done,        tone: "text-emerald-600" },
                      { label: "Total",       value: p.counts.total,       tone: "text-slate-800" },
                    ].map(({ label, value, tone }) => (
                      <div key={label} className="py-4 text-center">
                        <CountPill label={label} value={value} tone={tone} />
                      </div>
                    ))}
                  </div>

                  {/* GitHub commit strip */}
                  <div className="px-6 py-3 flex items-center gap-4 text-xs bg-slate-50">
                    {p.latestCommit ? (
                      <>
                        <GitCommit size={13} className="text-slate-400 shrink-0" />
                        <a
                          href={p.latestCommit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-slate-400 hover:text-indigo-600 shrink-0"
                        >
                          {p.latestCommit.sha}
                        </a>
                        <span className="flex-1 truncate text-slate-600">{p.latestCommit.message}</span>
                        <span className="text-slate-400 shrink-0">by {p.latestCommit.author}</span>
                        <span className="text-slate-400 shrink-0">{timeAgo(p.latestCommit.date)}</span>
                        <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0">
                          {p.commitsWeek} commits/week
                        </span>
                      </>
                    ) : p.loaded ? (
                      <span className="text-slate-400 italic">No GitHub commits found for this repo</span>
                    ) : (
                      <span className="animate-pulse text-slate-400">Loading commit history…</span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="px-6 py-3 flex gap-3 border-t border-slate-100">
                    <Link
                      href="/boards"
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Open Board →
                    </Link>
                    <Link
                      href="/activity"
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Activity Log
                    </Link>
                    <Link
                      href="/scheduled"
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Scheduled Jobs
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
