"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HelpCircle,
  RefreshCw,
  Timer,
} from "lucide-react";
import { CalendarView } from "./Calendar";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { formatRelativeTimestamp } from "@/lib/formatters";

type CronHealth = "ok" | "stale" | "unknown";

export type CronJob = {
  job_id: string;
  name: string;
  agent_id: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  session_target: string;
  wake_mode: string;
  payload_kind: string;
  summary: string;
  next_run: string | null;
  last_run: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
  consecutive_errors: number;
  health: CronHealth;
};

type CronJobsResponse = {
  ok: boolean;
  source: string;
  job_count: number;
  generated_at: string;
  jobs: CronJob[];
};

function HealthIcon({ health }: { health: CronHealth }) {
  if (health === "ok") return <CheckCircle2 size={15} className="text-emerald-500" />;
  if (health === "stale") return <AlertTriangle size={15} className="text-amber-500" />;
  return <HelpCircle size={15} className="text-slate-400" />;
}

function HealthBadge({ health }: { health: CronHealth }) {
  const tone =
    health === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : health === "stale"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-50 text-slate-600 border-slate-200";
  const label = health === "ok" ? "Healthy" : health === "stale" ? "Needs Attention" : "Unknown";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      <HealthIcon health={health} />
      {label}
    </span>
  );
}

function JobCard({ job }: { job: CronJob }) {
  const parts = job.schedule.split(" ");
  const minPart = parts.length > 0 && !isNaN(Number(parts[0])) ? parts[0].padStart(2, "0") : "00";

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
      <div className="absolute -left-3 top-6 h-6 w-6 -translate-x-full rounded-full border-4 border-slate-50 bg-indigo-100 dark:border-slate-900" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              <Clock3 size={12} />
              {job.schedule.includes("* * *") && !isNaN(Number(parts[1])) ? `${parts[1].padStart(2, "0")}:${minPart}` : job.schedule}
            </span>
            <h2 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.name}</h2>
            <HealthBadge health={job.health} />
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
               <Bot size={12} />
               {job.agent_id.toUpperCase()}
            </span>
          </div>
          <p className="max-w-2xl text-sm text-slate-600 leading-relaxed">
            {job.summary || "No payload summary available."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Run</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {job.last_run ? formatRelativeTimestamp(job.last_run) : "Not run yet"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {job.last_status ?? "No status yet"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Run</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {job.next_run ? formatRelativeTimestamp(job.next_run) : "Not scheduled"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {job.enabled ? "Enabled" : "Disabled"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {job.session_target}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">{job.payload_kind}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Health</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {job.consecutive_errors > 0 ? `${job.consecutive_errors} errors` : "100% Reliable"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {job.last_duration_ms !== null ? `${(job.last_duration_ms / 1000).toFixed(1)}s avg` : "No duration"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ScheduledPage() {
  const [data, setData] = useState<CronJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | CronHealth>("all");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/health/cron-jobs", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CronJobsResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 60_000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const jobs = data?.jobs ?? [];
  const filteredJobs = useMemo(
    () => jobs.filter((job) => filter === "all" || job.health === filter),
    [jobs, filter],
  );

  const counts = useMemo(
    () => ({
      ok: jobs.filter((job) => job.health === "ok").length,
      stale: jobs.filter((job) => job.health === "stale").length,
      unknown: jobs.filter((job) => job.health === "unknown").length,
    }),
    [jobs],
  );

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Timer size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Scheduled Jobs</h1>
                  <p className="text-sm text-slate-500">
                    Native OpenClaw cron only. No crontab, launchd, or sidecar loop runtime is expected.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchJobs}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Source</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Native Cron</p>
              <p className="mt-1 text-sm text-slate-500">{data?.source ?? "native-openclaw-cron"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jobs</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{jobs.length}</p>
              <p className="mt-1 text-sm text-slate-500">Canonical scheduler entries</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Healthy</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">{counts.ok}</p>
              <p className="mt-1 text-sm text-slate-500">Running on schedule</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Attention</p>
              <p className="mt-2 text-lg font-semibold text-amber-700">{counts.stale + counts.unknown}</p>
              <p className="mt-1 text-sm text-slate-500">Stale or not yet verified</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {([
              ["all", "All"],
              ["ok", "Healthy"],
              ["stale", "Needs Attention"],
              ["unknown", "Unknown"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  filter === value
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <Clock3 size={13} />
              Refreshed {data?.generated_at ? formatRelativeTimestamp(data.generated_at) : "just now"}
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Failed to load native cron state: {error}
            </div>
          ) : null}

          <div className="mt-8">
            {loading && jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm mt-8 border-t pt-8">
                Loading schedule timeline…
              </div>
            ) : null}

            {!loading && filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm mt-8 border-t pt-8">
                No jobs match the current filter.
              </div>
            ) : (
              <CalendarView jobs={filteredJobs} />
            )}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
