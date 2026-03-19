"use client";

import { useEffect, useState } from "react";
import { GitCommit, FolderGit2, Activity, ExternalLink } from "lucide-react";

type BoardCounts = {
  inbox: number;
  in_progress: number;
  review: number;
  done: number;
};

type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

type ProjectData = {
  board: BoardCounts;
  latestCommit: CommitInfo | null;
  commitsThisWeek: number;
};

const GITHUB_REPO = "noamshabtaiopenclawagent-dot/job-hunter-os";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const API_BASE = "http://127.0.0.1:8000/api/v1";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ counts }: { counts: BoardCounts }) {
  const stagnant = counts.in_progress > 10;
  const active = counts.in_progress > 0 || counts.review > 0;
  if (stagnant) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">🔴 Stagnant</span>;
  if (active) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">🟡 Active</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">🟢 On Track</span>;
}

export function ProjectStatusPanel() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // Fetch board stats from Mission Control API
        const boardsRes = await fetch(`${API_BASE}/boards?limit=100`, { cache: "no-store" });
        const boardsData = await boardsRes.json();
        const boards: { id: string; name: string }[] = boardsData.items ?? boardsData;
        const jhosBoard = boards.find((b) => b.name === "Job Hunter OS");

        let board: BoardCounts = { inbox: 0, in_progress: 0, review: 0, done: 0 };
        if (jhosBoard) {
          const tasksRes = await fetch(`${API_BASE}/boards/${jhosBoard.id}/tasks?limit=500`, { cache: "no-store" });
          const tasksData = await tasksRes.json();
          const tasks: { status: string }[] = tasksData.items ?? tasksData;
          board = tasks.reduce((acc, t) => {
            const s = t.status as keyof BoardCounts;
            if (s in acc) acc[s]++;
            return acc;
          }, { inbox: 0, in_progress: 0, review: 0, done: 0 });
        }

        // Fetch GitHub commits (unauthenticated — public repo)
        let latestCommit: CommitInfo | null = null;
        let commitsThisWeek = 0;
        try {
          const ghRes = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=30`,
            { headers: { Accept: "application/vnd.github.v3+json" }, next: { revalidate: 300 } }
          );
          if (ghRes.ok) {
            const commits = await ghRes.json();
            if (commits.length > 0) {
              const c = commits[0];
              latestCommit = {
                sha: c.sha.slice(0, 7),
                message: c.commit.message.split("\n")[0].slice(0, 80),
                author: c.commit.author.name,
                date: c.commit.author.date,
                url: c.html_url,
              };
              const sevenDaysAgo = Date.now() - 7 * 86400000;
              commitsThisWeek = commits.filter(
                (x: { commit: { author: { date: string } } }) =>
                  new Date(x.commit.author.date).getTime() > sevenDaysAgo
              ).length;
            }
          }
        } catch {
          // GitHub API failed — non-critical
        }

        if (mounted) setData({ board, latestCommit, commitsThisWeek });
      } catch {
        if (mounted) setError(true);
      }
    }

    load();
    const id = setInterval(load, 60_000); // refresh every minute
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (error) return null;

  return (
    <div className="border-b border-slate-100 bg-white px-4 py-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Project label */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <FolderGit2 size={13} className="text-indigo-500 shrink-0" />
          Job Hunter OS
          <ExternalLink size={10} className="text-slate-400" />
        </a>

        <div className="h-3 w-px bg-slate-200 shrink-0" />

        {/* Board counts */}
        {data ? (
          <>
            <StatusBadge counts={data.board} />
            <span className="text-slate-400">
              <span className="font-semibold text-slate-600">{data.board.inbox}</span> inbox ·{" "}
              <span className="font-semibold text-amber-600">{data.board.in_progress}</span> active ·{" "}
              <span className="font-semibold text-violet-600">{data.board.review}</span> review ·{" "}
              <span className="font-semibold text-emerald-600">{data.board.done}</span> done
            </span>

            {data.latestCommit && (
              <>
                <div className="h-3 w-px bg-slate-200 shrink-0" />
                <a
                  href={data.latestCommit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <GitCommit size={11} className="shrink-0" />
                  <span className="font-mono text-[10px] text-slate-400">{data.latestCommit.sha}</span>
                  <span className="max-w-[200px] truncate">{data.latestCommit.message}</span>
                  <span className="text-slate-400 shrink-0">· {timeAgo(data.latestCommit.date)}</span>
                </a>
                <div className="h-3 w-px bg-slate-200 shrink-0" />
                <span className="flex items-center gap-1 text-slate-400">
                  <Activity size={11} />
                  <span className="font-semibold text-slate-600">{data.commitsThisWeek}</span> commits this week
                </span>
              </>
            )}
          </>
        ) : (
          <span className="animate-pulse text-slate-400">Loading project status…</span>
        )}
      </div>
    </div>
  );
}
