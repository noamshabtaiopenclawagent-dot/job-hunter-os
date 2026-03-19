import { NextResponse } from "next/server";

// Fetch real application pipeline data from Mission Control
const MC_API = "http://127.0.0.1:8000/api/v1";
const BOARD_NAME = "Job Hunter OS";

// Cache for 60 seconds
let cache: { data: Application[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

export interface Application {
  id: string;
  title: string;
  company: string;
  stage: "applied" | "screen" | "assignment" | "interview" | "offer" | "rejected" | "in_progress" | "review" | "done";
  priority: string;
  daysInStage: number;
  lastAction: string;
  updatedAt: string;
  createdAt: string;
}

function mcStatusToStage(status: string, title: string): Application["stage"] {
  const t = (title || "").toLowerCase();
  if (t.includes("offer")) return "offer";
  if (t.includes("interview") || t.includes("panel")) return "interview";
  if (t.includes("assignment") || t.includes("take-home")) return "assignment";
  if (t.includes("screen") || t.includes("phone")) return "screen";
  if (t.includes("reject") || t.includes("fail")) return "rejected";
  if (status === "done") return "done";
  if (status === "review") return "review";
  if (status === "in_progress") return "in_progress";
  return "applied";
}

function companyFromTitle(title: string): string {
  // Extract company name from patterns like "[JHOS-DEV] Feature at Company"
  const atMatch = title.match(/\bat\s+([A-Z][a-zA-Z\s&]+?)(?:\s*[-–—]|$)/);
  if (atMatch) return atMatch[1].trim();
  // Known company patterns
  const companies = ["Wix", "Monday", "Check Point", "IronSource", "Fiverr", "Elementor", "Taboola", "AppsFlyer", "Imperva", "Varonis", "CyberArk"];
  for (const c of companies) {
    if (title.includes(c)) return c;
  }
  return "Company";
}

async function getToken(): Promise<string> {
  const fs = await import("fs");
  const path = await import("path");
  const envPath = path.join(process.env.HOME || "", ".openclaw/workspace/openclaw-mission-control/backend/.env");
  const raw = fs.readFileSync(envPath, "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("LOCAL_AUTH_TOKEN="));
  if (!line) throw new Error("Token missing");
  return line.split("=").slice(1).join("=").trim();
}

async function fetchPipeline(): Promise<Application[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const boardsRes = await fetch(`${MC_API}/boards?limit=100`, { headers });
  const boardsData = await boardsRes.json();
  const boards: { id: string; name: string }[] = boardsData.items ?? boardsData;
  const board = boards.find((b) => b.name === BOARD_NAME);
  if (!board) return [];

  const tasksRes = await fetch(`${MC_API}/boards/${board.id}/tasks?limit=200`, { headers });
  const tasksData = await tasksRes.json();
  const tasks: {
    id: string; title: string; status: string; priority: string;
    created_at: string; updated_at: string; description?: string;
  }[] = tasksData.items ?? tasksData;

  const now = Date.now();
  const apps: Application[] = tasks
    .filter((t) => t.status !== "inbox") // only active work
    .map((t) => ({
      id: t.id,
      title: t.title.replace(/^\[[\w-]+\]\s*/, ""), // strip prefix
      company: companyFromTitle(t.title),
      stage: mcStatusToStage(t.status, t.title),
      priority: t.priority ?? "medium",
      daysInStage: Math.floor((now - new Date(t.updated_at).getTime()) / 86400000),
      lastAction: t.description
        ? t.description.split("\n").filter((l) => l.trim()).pop()?.slice(0, 80) ?? "In progress"
        : "In progress",
      updatedAt: t.updated_at,
      createdAt: t.created_at,
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 50);

  cache = { data: apps, ts: Date.now() };
  return apps;
}

export async function GET() {
  try {
    const apps = await fetchPipeline();
    const counts = apps.reduce(
      (acc, a) => {
        const k = a.stage as keyof typeof acc;
        if (k in acc) acc[k]++;
        return acc;
      },
      { in_progress: 0, review: 0, done: 0, applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0, assignment: 0 }
    );
    return NextResponse.json({ total: apps.length, counts, applications: apps });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
