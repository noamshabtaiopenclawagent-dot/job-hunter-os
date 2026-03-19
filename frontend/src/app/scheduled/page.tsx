"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  RefreshCw,
  Timer,
} from "lucide-react";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { formatRelativeTimestamp } from "@/lib/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

type CronHealth = "ok" | "stale" | "unknown";

type CronJob = {
  job_id: string;
  schedule: string;
  name: string;
  entrypoint: string;
  domain: string;
  expected_kind: string;
  log_file: string | null;
  log_last_run: string | null;
  log_size_kb: number | null;
  log_tail: string[];
  next_run: string | null;
  risk_flags: string[];
  health: CronHealth;
};

type CronJobsResponse = {
  ok: boolean;
  job_count: number;
  generated_at: string;
  jobs: CronJob[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  ops: "bg-blue-50 text-blue-700 border-blue-200",
  "finance/data/venture/roadmap": "bg-violet-50 text-violet-700 border-violet-200",
  research: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function domainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? "bg-slate-50 text-slate-600 border-slate-200";
}

function HealthIcon({ health }: { health: CronHealth }) {
  if (health === "ok")
    return <CheckCircle size={14} className="text-emerald-500" />;
  if (health === "stale")
    return <AlertTriangle size={14} className="text-amber-500" />;
  return <HelpCircle size={14} className="text-slate-400" />;
}

function HealthBadge({ health }: { health: CronHealth }) {
  const cls =
    health === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : health === "stale"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-50 text-slate-500 border-slate-200";
  const label =
    health === "ok" ? "OK" : health === "stale" ? "Stale" : "Unknown";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      <HealthIcon health={health} />
      {label}
    </span>
  );
}

function formatSchedule(s: string): string {
  const map: Record<string, string> = {
    "*/15 * * * *": "Every 15 min",
    "*/30 * * * *": "Every 30 min",
    "0 * * * *": "Hourly",
    "0 0 * * *": "Daily midnight",
    "0 1 * * *": "Daily 01:00",
    "0 3 * * *": "Daily 03:00",
    "0 6 * * *": "Daily 06:00",
    "0 23 * * 0": "Weekly Sun 23:00",
    "30 2 * * 0": "Weekly Sun 02:30",
  };
  return map[s] ?? s;
}

// ─── Job Row ─────────────────────────────────────────────────────────────────

function CronJobRow({ job }: { job: CronJob }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:shadow-sm">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <HealthIcon health={job.health} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-strong">
              {job.name}
            </span>
            {job.risk_flags.length > 0 && (
              <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">
                ⚠ {job.risk_flags[0]}
              </span>
            )}
            <span
              className={`rounded border px-1.5 py-0.5 text-[11px] ${domainColor(job.domain)}`}
            >
              {job.domain}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{formatSchedule(job.schedule)}</p>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {/* Last run */}
          <div className="text-right">
            <p className="text-xs text-quiet">Last run</p>
            <p className="text-xs font-medium text-muted">
              {job.log_last_run
                ? formatRelativeTimestamp(job.log_last_run)
                : "—"}
            </p>
          </div>
          {/* Next run */}
          <div className="text-right">
            <p className="text-xs text-quiet">Next run</p>
            <p className="text-xs font-medium text-muted">
              {job.next_run ? formatRelativeTimestamp(job.next_run) : "—"}
            </p>
          </div>
          {/* Log size */}
          <div className="text-right">
            <p className="text-xs text-quiet">Log</p>
            <p className="text-xs font-medium text-muted">
              {job.log_size_kb !== null ? `${job.log_size_kb} KB` : "—"}
            </p>
          </div>
          <HealthBadge health={job.health} />
        </div>

        {expanded ? (
          <ChevronDown size={14} className="ml-2 shrink-0 text-quiet" />
        ) : (
          <ChevronRight size={14} className="ml-2 shrink-0 text-quiet" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[color:var(--border)] px-5 py-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-quiet">
                Schedule
              </p>
              <p className="mt-1 font-mono text-xs text-muted">{job.schedule}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-quiet">
                Script
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                {job.entrypoint}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-quiet">
                Output type
              </p>
              <p className="mt-1 text-xs text-muted">{job.expected_kind}</p>
            </div>
          </div>

          {job.log_tail.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-quiet">
                Log tail (last 3 lines)
              </p>
              <div className="rounded-lg bg-slate-900 p-4">
                {job.log_tail.map((line, i) => (
                  <p
                    key={i}
                    className="font-mono text-[11px] leading-relaxed text-slate-300"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScheduledPage() {
  const [data, setData] = useState<CronJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "ok" | "stale" | "unknown">("all");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/health/cron-jobs");
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

  const filteredJobs =
    data?.jobs.filter((j) => filter === "all" || j.health === filter) ?? [];

  const okCount = data?.jobs.filter((j) => j.health === "ok").length ?? 0;
  const staleCount = data?.jobs.filter((j) => j.health === "stale").length ?? 0;
  const unknownCount = data?.jobs.filter((j) => j.health === "unknown").length ?? 0;

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-quiet">
                System
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-strong">
                Scheduled Tasks
              </h1>
              <p className="mt-1 text-sm text-muted">
                All cron jobs and automation scripts.{" "}
                {data && `${data.job_count} jobs registered.`}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchJobs}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-2 text-sm text-muted shadow-sm transition hover:text-strong disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Stats bar */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: "Healthy", count: okCount, icon: <CheckCircle size={16} className="text-emerald-500" />, color: "border-l-emerald-400" },
              { label: "Stale", count: staleCount, icon: <AlertTriangle size={16} className="text-amber-500" />, color: "border-l-amber-400" },
              { label: "Unknown", count: unknownCount, icon: <HelpCircle size={16} className="text-slate-400" />, color: "border-l-slate-300" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl border border-[color:var(--border)] border-l-4 bg-white p-4 shadow-sm ${stat.color}`}
              >
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="text-xs font-semibold uppercase text-quiet">
                    {stat.label}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-strong">
                  {loading ? "—" : stat.count}
                </p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="mb-4 flex items-center gap-1 border-b border-[color:var(--border)]">
            {(["all", "ok", "stale", "unknown"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
                  filter === f
                    ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                    : "border-transparent text-muted hover:text-strong"
                }`}
              >
                {f === "all" ? `All (${data?.job_count ?? 0})` : f}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Job list */}
          {loading && !data ? (
            <div className="flex h-40 items-center justify-center">
              <span className="animate-pulse text-sm text-muted">
                Loading cron jobs…
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <CronJobRow key={job.job_id} job={job} />
              ))}
              {filteredJobs.length === 0 && (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] text-sm text-muted">
                  No jobs match the selected filter.
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {data && (
            <p className="mt-6 text-center text-xs text-quiet">
              <Clock size={10} className="mr-1 inline" />
              Auto-refreshes every 60s · Last fetch:{" "}
              {new Date(data.generated_at).toLocaleTimeString()}
            </p>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
