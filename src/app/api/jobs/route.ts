import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Real Israeli job data from benzaquenruth/data_analyst_job_postings
// Source: https://github.com/benzaquenruth/data_analyst_job_postings
const DATA_URL =
  "https://github.com/benzaquenruth/data_analyst_job_postings/raw/main/Job%20Listings%20Database.xlsx";

// Cache in memory for 6 hours (avoids hitting GitHub on every request)
let cache: { data: JobListing[]; ts: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  score: number;   // relevance score 0-100
  fit: number;     // fit score 0-100
  tags: string[];
  posted: string;
  url: string;
  status: "new" | "seen" | "applied";
}

function parseScore(raw: unknown): number {
  if (raw == null) return 50;
  const n = Number(raw);
  if (isNaN(n)) return 50;
  // Dataset may store as 0-1 or 0-100
  return n <= 1 ? Math.round(n * 100) : Math.min(100, Math.round(n));
}

function extractTags(row: Record<string, unknown>): string[] {
  const tagFields = ["Skills", "Tech Stack", "Tools", "Requirements", "Keywords"];
  for (const f of tagFields) {
    const val = row[f];
    if (val && typeof val === "string" && val.trim()) {
      return val
        .split(/[,;|\/]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t.length < 25)
        .slice(0, 5);
    }
  }
  return [];
}

function postedLabel(raw: unknown): string {
  if (!raw) return "Recently";
  const d = new Date(String(raw));
  if (isNaN(d.getTime())) return "Recently";
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

async function fetchJobs(): Promise<JobListing[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return cache.data;

  const resp = await fetch(DATA_URL, { next: { revalidate: 21600 } });
  if (!resp.ok) throw new Error(`Failed to fetch dataset: ${resp.status}`);

  const buffer = await resp.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const jobs: JobListing[] = rows
    .filter((r) => r["Job Title"] || r["Title"] || r["title"] || r["Position"])
    .map((r, i) => {
      const title = String(r["Job Title"] ?? r["Title"] ?? r["title"] ?? r["Position"] ?? "Untitled");
      const company = String(r["Company"] ?? r["company"] ?? r["Employer"] ?? "");
      const location = String(r["Location"] ?? r["location"] ?? r["City"] ?? "Israel");
      const source = String(r["Source"] ?? r["source"] ?? r["Platform"] ?? r["Website"] ?? "Job Board");
      const relevance = parseScore(r["Job Relevance Score"] ?? r["Relevance Score"] ?? r["Relevance"] ?? r["relevance_score"]);
      const fit = parseScore(r["Fit Score"] ?? r["fit_score"] ?? r["Match Score"] ?? relevance);
      const score = Math.round((relevance * 0.6) + (fit * 0.4));

      return {
        id: String(i),
        title,
        company,
        location: location || "Israel",
        source,
        score,
        fit,
        tags: extractTags(r),
        posted: postedLabel(r["Date Posted"] ?? r["Posted Date"] ?? r["date"] ?? r["Date"]),
        url: String(r["URL"] ?? r["Link"] ?? r["url"] ?? ""),
        status: "new" as const,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 100); // top 100 by score

  cache = { data: jobs, ts: Date.now() };
  return jobs;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const minScore = Number(searchParams.get("min_score") ?? 0);

    const jobs = await fetchJobs();
    const filtered = jobs.filter(
      (j) =>
        j.score >= minScore &&
        (!query ||
          j.title.toLowerCase().includes(query) ||
          j.company.toLowerCase().includes(query) ||
          j.tags.some((t) => t.toLowerCase().includes(query)))
    );

    return NextResponse.json({ total: filtered.length, jobs: filtered });
  } catch (e) {
    console.error("[/api/jobs]", e);
    return NextResponse.json(
      { error: "Failed to fetch job data", detail: String(e) },
      { status: 500 }
    );
  }
}
