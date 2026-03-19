import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const WORKSPACE = path.join(process.env.HOME ?? "/root", ".openclaw/workspace");
const LOG_CANDIDATES = path.join(WORKSPACE, "local/state");

/** Parse active crontab entries (non-comment, non-empty lines with a script path) */
function parseCrontab(): {
  job_id: string;
  schedule: string;
  name: string;
  command: string;
  log_file: string | null;
  health: "ok" | "stale" | "unknown";
  next_run: string | null;
  log_last_modified: string | null;
}[] {
  let raw = "";
  try {
    raw = execSync("crontab -l 2>/dev/null", { timeout: 3000 }).toString();
  } catch {
    return [];
  }

  const lines = raw.split("\n").filter((l) => {
    const trimmed = l.trim();
    return trimmed && !trimmed.startsWith("#");
  });

  return lines.map((line, idx) => {
    const parts = line.trim().split(/\s+/);
    // cron format: min hour dom month dow [command...]
    const cronFields = parts.slice(0, 5).join(" ");
    const command = parts.slice(5).join(" ");

    // Extract a human-readable name from the command
    const nameMatch = command.match(/guarded-run\.sh\s+(\S+)/) ||
                       command.match(/agents\/(\S+?)\.(?:cjs|sh|js)/) ||
                       command.match(/cron\/(\S+?)\.sh/);
    const name = nameMatch?.[1]?.replace(/-/g, " ") ?? `job-${idx}`;

    // Try to find associated log file
    const logMatch = command.match(/>>?\s*(\S+\.log)/);
    const guardedNameMatch = command.match(/guarded-run\.sh\s+(\S+)/);
    let logFile: string | null = null;
    if (logMatch) {
      logFile = logMatch[1];
    } else if (guardedNameMatch) {
      logFile = path.join(WORKSPACE, "local/logs", `${guardedNameMatch[1]}.log`);
    }

    // Check log health
    let health: "ok" | "stale" | "unknown" = "unknown";
    let logLastModified: string | null = null;
    if (logFile) {
      try {
        if (fs.existsSync(logFile)) {
          const stat = fs.statSync(logFile);
          logLastModified = stat.mtime.toISOString();
          const ageMs = Date.now() - stat.mtime.getTime();
          // If modified within 2h → ok, within 24h → stale else unknown
          health = ageMs < 2 * 3600000 ? "ok" : ageMs < 24 * 3600000 ? "stale" : "unknown";
        }
      } catch { /* ignore */ }
    }

    // Simple next-run estimate for */N schedules
    let nextRun: string | null = null;
    try {
      const [min, hour] = cronFields.split(" ");
      const now = new Date();
      const next = new Date(now);
      next.setSeconds(0, 0);
      if (min.startsWith("*/")) {
        const interval = parseInt(min.slice(2));
        const curr = next.getMinutes();
        const step = Math.ceil((curr + 1) / interval) * interval;
        if (step < 60) next.setMinutes(step); else { next.setHours(next.getHours() + 1); next.setMinutes(step - 60); }
        nextRun = next.toISOString();
      } else if (hour === "*" || hour.startsWith("*/")) {
        next.setMinutes(parseInt(min) || 0, 0, 0);
        if (next <= now) next.setHours(next.getHours() + 1);
        nextRun = next.toISOString();
      } else {
        next.setHours(parseInt(hour) || 0, parseInt(min) || 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        nextRun = next.toISOString();
      }
    } catch { /* ignore */ }

    return {
      job_id: `cron-${idx}`,
      schedule: cronFields,
      name,
      command: command.slice(0, 120),
      log_file: logFile,
      health,
      next_run: nextRun,
      log_last_modified: logLastModified,
    };
  });
}

export async function GET() {
  try {
    const jobs = parseCrontab();
    return NextResponse.json({
      ok: true,
      job_count: jobs.length,
      generated_at: new Date().toISOString(),
      crontab_exists: jobs.length > 0,
      jobs,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
