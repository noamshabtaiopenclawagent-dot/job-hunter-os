"use client";

import { useMemo } from "react";
import { GitCommit, FolderGit2, Activity, ExternalLink, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import {
  type listBoardsApiV1BoardsGetResponse,
  useListBoardsApiV1BoardsGet,
} from "@/api/generated/boards/boards";
import {
  type listTasksApiV1BoardsBoardIdTasksGetResponse,
  useListTasksApiV1BoardsBoardIdTasksGet,
} from "@/api/generated/tasks/tasks";

const GITHUB_REPO = "noamshabtaiopenclawagent-dot/job-hunter-os";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const BOARD_NAME = "Job Hunter OS";

type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
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

type GitData = {
  latestCommit: CommitInfo | null;
  commitsThisWeek: number;
  loaded: boolean;
};

function useGitData(): GitData {
  const [state, setState] = React.useState<GitData>({ latestCommit: null, commitsThisWeek: 0, loaded: false });

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=30`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });
        if (!r.ok) return;
        const commits = await r.json();
        if (!commits.length) { setState({ latestCommit: null, commitsThisWeek: 0, loaded: true }); return; }
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        const commitsThisWeek = commits.filter(
          (c: { commit: { author: { date: string } } }) =>
            new Date(c.commit.author.date).getTime() > sevenDaysAgo
        ).length;
        const c = commits[0];
        setState({
          latestCommit: {
            sha: c.sha.slice(0, 7),
            message: c.commit.message.split("\n")[0].slice(0, 72),
            author: c.commit.author.name,
            date: c.commit.author.date,
            url: c.html_url,
          },
          commitsThisWeek,
          loaded: true,
        });
      } catch { setState((s) => ({ ...s, loaded: true })); }
    })();
  }, []);

  return state;
}

import React from "react";

export function ProjectStatusPanel() {
  const { isSignedIn } = useAuth();

  const boardsQuery = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    { limit: 100 },
    { query: { enabled: Boolean(isSignedIn), refetchInterval: 60_000 } }
  );

  const jhosBoard = useMemo(() => {
    if (boardsQuery.data?.status !== 200) return null;
    return (boardsQuery.data.data.items ?? []).find((b) => b.name === BOARD_NAME) ?? null;
  }, [boardsQuery.data]);

  const tasksQuery = useListTasksApiV1BoardsBoardIdTasksGet<listTasksApiV1BoardsBoardIdTasksGetResponse, ApiError>(
    jhosBoard?.id ?? "",
    { limit: 500 },
    { query: { enabled: Boolean(isSignedIn && jhosBoard?.id), refetchInterval: 60_000 } }
  );

  const counts = useMemo(() => {
    if (tasksQuery.data?.status !== 200) return null;
    const tasks = tasksQuery.data.data.items ?? [];
    return tasks.reduce(
      (acc, t) => {
        const s = t.status as keyof typeof acc;
        if (s in acc) acc[s]++;
        return acc;
      },
      { inbox: 0, in_progress: 0, review: 0, done: 0 }
    );
  }, [tasksQuery.data]);

  const git = useGitData();

  // Determine health
  const stagnant = counts && counts.in_progress > 20;
  const active = counts && (counts.in_progress > 0 || counts.review > 0);

  if (!isSignedIn) return null;

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

        {/* Health badge */}
        {counts ? (
          stagnant ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
              <AlertTriangle size={10} /> Stagnant
            </span>
          ) : active ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <Clock size={10} /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 size={10} /> On Track
            </span>
          )
        ) : null}

        {/* Board counts */}
        {counts ? (
          <span className="text-slate-400">
            <span className="font-semibold text-slate-600">{counts.inbox}</span> inbox ·{" "}
            <span className="font-semibold text-amber-600">{counts.in_progress}</span> active ·{" "}
            <span className="font-semibold text-violet-600">{counts.review}</span> review ·{" "}
            <span className="font-semibold text-emerald-600">{counts.done}</span> done
          </span>
        ) : (
          <span className="animate-pulse text-slate-400">Loading board…</span>
        )}

        {/* GitHub commit strip */}
        {git.loaded && git.latestCommit && (
          <>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <a
              href={git.latestCommit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <GitCommit size={11} className="shrink-0" />
              <span className="font-mono text-[10px] text-slate-400">{git.latestCommit.sha}</span>
              <span className="max-w-[200px] truncate">{git.latestCommit.message}</span>
              <span className="text-slate-400 shrink-0">· {timeAgo(git.latestCommit.date)}</span>
            </a>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <span className="flex items-center gap-1 text-slate-400">
              <Activity size={11} />
              <span className="font-semibold text-slate-600">{git.commitsThisWeek}</span> commits/week
            </span>
          </>
        )}
        {git.loaded && !git.latestCommit && (
          <>
            <div className="h-3 w-px bg-slate-200 shrink-0" />
            <span className="text-slate-400 italic text-[11px]">No GitHub commits found</span>
          </>
        )}
      </div>
    </div>
  );
}
