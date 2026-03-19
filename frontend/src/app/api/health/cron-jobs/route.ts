import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR =
  process.env.OPENCLAW_DIR ??
  path.join(process.env.HOME ?? "/root", ".openclaw");

const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");
const CRON_INVENTORY_PATH = path.join(
  WORKSPACE_DIR,
  "local/state/cron-inventory.json",
);
const CRONTAB_PATH = path.join(WORKSPACE_DIR, "crontab.txt");

type CronInventoryRow = {
  job_id: string;
  schedule: string;
  command_short: string;
  entrypoint: string;
  domain: string;
  expected_kind: string;
  source_used: string;
  primary_log_file: string;
  artifact_path: string;
  risk_flags: string[];
};

type CronInventory = {
  generated_at: string;
  rows: CronInventoryRow[];
};

function readFileIfExists(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Read the last N lines of a log file */
function readLogTail(logFile: string, lines: number = 5): string[] {
  const content = readFileIfExists(logFile);
  if (!content) return [];
  const allLines = content.trim().split("\n");
  return allLines.slice(-lines).filter(Boolean);
}

/** Compute next cron run from schedule expression (simplified) */
function computeNextRun(schedule: string): string | null {
  try {
    const [min, hour, dom, month, dow] = schedule.split(" ");
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0, 0);

    // Handle simple cases
    if (min.startsWith("*/")) {
      const interval = parseInt(min.slice(2));
      const currentMin = next.getMinutes();
      const nextMin = Math.ceil((currentMin + 1) / interval) * interval;
      if (nextMin < 60) {
        next.setMinutes(nextMin);
      } else {
        next.setHours(next.getHours() + 1);
        next.setMinutes(nextMin - 60);
      }
      return next.toISOString();
    }

    if (hour.startsWith("*/")) {
      const interval = parseInt(hour.slice(2));
      const currentHour = next.getHours();
      const nextHour = Math.ceil((currentHour + 1) / interval) * interval;
      next.setHours(nextHour % 24);
      next.setMinutes(parseInt(min) || 0);
      if (nextHour >= 24) next.setDate(next.getDate() + 1);
      return next.toISOString();
    }

    // For fixed daily/weekly jobs just give the time today or tomorrow
    const targetHour = parseInt(hour) || 0;
    const targetMin = parseInt(min) || 0;
    next.setHours(targetHour, targetMin, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next.toISOString();
  } catch {
    return null;
  }
}

function getLogLastModified(logFile: string): string | null {
  try {
    if (!logFile || !fs.existsSync(logFile)) return null;
    const stat = fs.statSync(logFile);
    return stat.mtime.toISOString();
  } catch {
    return null;
  }
}

function getLogSizeKb(logFile: string): number | null {
  try {
    if (!logFile || !fs.existsSync(logFile)) return null;
    const stat = fs.statSync(logFile);
    return Math.round(stat.size / 1024);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const jobsPath = path.join(OPENCLAW_DIR, "cron", "jobs.json");
    const jobsContent = readFileIfExists(jobsPath);

    let jobsList: any[] = [];

    if (jobsContent) {
      const parsed = JSON.parse(jobsContent);
      if (parsed.jobs && Array.isArray(parsed.jobs)) {
        jobsList = parsed.jobs.map((job: any) => {
          
          let scheduleStr = "Unknown";
          if (job.schedule) {
            if (job.schedule.kind === "cron" && job.schedule.expr) {
              scheduleStr = job.schedule.expr;
            } else if (job.schedule.kind === "every" && job.schedule.everyMs) {
              scheduleStr = `every ${Math.round(job.schedule.everyMs / 60000)}m`;
            }
          }

          const lastRunDate = job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : null;
          const nextRunDate = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : null;
          
          let health: "ok" | "stale" | "unknown" = "unknown";
          if (job.enabled === false) {
             health = "unknown";
          } else if (job.state?.lastStatus === "error" || job.state?.lastRunStatus === "error") {
             health = "stale"; // Mark as stale/warning if error
          } else if (lastRunDate) {
             health = "ok";
          }

          const entrypointStr = job.payload?.kind === "agentTurn" 
            ? "agent: " + (job.agentId || "unknown") 
            : "system event";

          return {
            job_id: job.id,
            schedule: scheduleStr,
            name: job.name || job.id,
            entrypoint: entrypointStr,
            domain: job.agentId || "system",
            expected_kind: job.payload?.kind || "unknown",
            log_file: null,
            log_last_run: lastRunDate,
            log_size_kb: null,
            log_tail: job.state?.lastError ? [job.state.lastError] : [],
            next_run: nextRunDate,
            risk_flags: job.enabled === false ? ["Disabled"] : [],
            health,
          };
        });
      }
    }

    return NextResponse.json({
      ok: true,
      job_count: jobsList.length,
      generated_at: new Date().toISOString(),
      crontab_exists: false,
      jobs: jobsList,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
