import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CRON_JOBS_FILE = path.join(
  process.env.HOME ?? "/root",
  ".openclaw",
  "cron",
  "jobs.json",
);

type CronHealth = "ok" | "stale" | "unknown";

type NativeCronJob = {
  id?: string;
  agentId?: string;
  name?: string;
  enabled?: boolean;
  schedule?: {
    kind?: string;
    expr?: string;
    tz?: string;
  };
  sessionTarget?: string;
  wakeMode?: string;
  payload?: {
    kind?: string;
    message?: string;
    text?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
    lastStatus?: string;
    lastDurationMs?: number;
    consecutiveErrors?: number;
  };
};

function toIso(ms?: number): string | null {
  return typeof ms === "number" && Number.isFinite(ms)
    ? new Date(ms).toISOString()
    : null;
}

function summarizePayload(payload?: NativeCronJob["payload"]): string {
  const raw = payload?.message ?? payload?.text ?? "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 220);
}

function deriveHealth(job: NativeCronJob): CronHealth {
  if (job.enabled === false) return "unknown";

  const nextRunAtMs = job.state?.nextRunAtMs;
  const lastRunAtMs = job.state?.lastRunAtMs;
  const consecutiveErrors = job.state?.consecutiveErrors ?? 0;
  const lastStatus = (job.state?.lastStatus ?? job.state?.lastRunStatus ?? "").toLowerCase();

  if (consecutiveErrors > 0) return "stale";
  if (lastStatus && lastStatus !== "ok") return "stale";

  if (!lastRunAtMs) {
    if (typeof nextRunAtMs === "number" && nextRunAtMs > Date.now()) {
      return "ok";
    }
    return "unknown";
  }

  if (typeof nextRunAtMs === "number" && Date.now() > nextRunAtMs + 30 * 60 * 1000) {
    return "stale";
  }

  return "ok";
}

export async function GET() {
  try {
    const raw = await fs.readFile(CRON_JOBS_FILE, "utf8");
    const parsed = JSON.parse(raw) as { jobs?: NativeCronJob[] };
    const jobs = (parsed.jobs ?? []).map((job, index) => ({
      job_id: job.id ?? `native-cron-${index}`,
      name: job.name ?? `job-${index + 1}`,
      agent_id: job.agentId ?? "unknown",
      enabled: job.enabled !== false,
      schedule: job.schedule?.expr ?? "",
      timezone: job.schedule?.tz ?? "UTC",
      session_target: job.sessionTarget ?? "main",
      wake_mode: job.wakeMode ?? "now",
      payload_kind: job.payload?.kind ?? "unknown",
      summary: summarizePayload(job.payload),
      next_run: toIso(job.state?.nextRunAtMs),
      last_run: toIso(job.state?.lastRunAtMs),
      last_status: job.state?.lastStatus ?? job.state?.lastRunStatus ?? null,
      last_duration_ms: job.state?.lastDurationMs ?? null,
      consecutive_errors: job.state?.consecutiveErrors ?? 0,
      health: deriveHealth(job),
    }));

    return NextResponse.json({
      ok: true,
      source: "native-openclaw-cron",
      generated_at: new Date().toISOString(),
      job_count: jobs.length,
      jobs,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
