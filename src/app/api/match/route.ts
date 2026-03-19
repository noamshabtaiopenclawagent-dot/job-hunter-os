import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// CV Profile — this is what Bob matches jobs against
// In Phase 3, this will be loaded from a user-uploaded CV
const CV_PROFILE = {
  skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "PostgreSQL", "Next.js", "Git", "REST API"],
  experience_years: 6,
  seniority: "senior",
  preferred_locations: ["Tel Aviv", "Herzliya", "Remote", "Hybrid"],
  preferred_domains: ["SaaS", "FinTech", "ProductTech", "B2B"],
  languages: ["Hebrew", "English"],
  avoid: ["Scala", "Kafka", ".NET", "C#", "PHP"],
};

const DATA_URL =
  "https://github.com/benzaquenruth/data_analyst_job_postings/raw/main/Job%20Listings%20Database.xlsx";

let rawCache: { rows: Record<string, unknown>[]; ts: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

export interface MatchedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  totalScore: number;
  factors: { label: string; score: number; detail: string; icon: string }[];
  gaps: string[];
  posted: string;
  url: string;
}

function scoreSkillOverlap(jobText: string): { score: number; detail: string } {
  const text = jobText.toLowerCase();
  const matched = CV_PROFILE.skills.filter((s) => text.includes(s.toLowerCase()));
  const avoided = CV_PROFILE.avoid.filter((s) => text.includes(s.toLowerCase()));
  const score = Math.min(100, Math.round((matched.length / Math.max(CV_PROFILE.skills.length * 0.4, 1)) * 100) - avoided.length * 15);
  return {
    score: Math.max(0, score),
    detail: matched.length > 0 ? `Matched: ${matched.slice(0, 4).join(", ")}` : "No direct skill overlap found",
  };
}

function scoreLocation(location: string): { score: number; detail: string } {
  const loc = location.toLowerCase();
  for (const pref of CV_PROFILE.preferred_locations) {
    if (loc.includes(pref.toLowerCase())) return { score: 100, detail: `${location} — preferred location` };
  }
  if (loc.includes("israel")) return { score: 75, detail: "Israel — within range" };
  return { score: 30, detail: "Location outside preference" };
}

function scoreSeniority(title: string): { score: number; detail: string } {
  const t = title.toLowerCase();
  if (t.includes("senior") || t.includes("lead") || t.includes("principal")) return { score: 95, detail: "Senior/Lead role — exact fit" };
  if (t.includes("mid") || t.includes("engineer") || t.includes("developer")) return { score: 75, detail: "Mid-level role — slightly below target" };
  if (t.includes("junior") || t.includes("entry")) return { score: 30, detail: "Junior role — below seniority target" };
  if (t.includes("manager") || t.includes("director")) return { score: 60, detail: "Management role — consider if desired" };
  return { score: 65, detail: "Seniority level unclear" };
}

async function fetchRows(): Promise<Record<string, unknown>[]> {
  if (rawCache && Date.now() - rawCache.ts < CACHE_TTL) return rawCache.rows;
  const resp = await fetch(DATA_URL, { next: { revalidate: 21600 } });
  if (!resp.ok) throw new Error(`Dataset fetch failed: ${resp.status}`);
  const buffer = await resp.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  rawCache = { rows, ts: Date.now() };
  return rows;
}

function postedLabel(raw: unknown): string {
  if (!raw) return "Recently";
  const d = new Date(String(raw));
  if (isNaN(d.getTime())) return "Recently";
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return diffDays < 7 ? `${diffDays}d ago` : `${Math.floor(diffDays / 7)}w ago`;
}

export async function GET() {
  try {
    const rows = await fetchRows();
    const results: MatchedJob[] = rows
      .filter((r) => r["Job Title"] || r["Title"] || r["title"] || r["Position"])
      .slice(0, 200)
      .map((r, i) => {
        const title = String(r["Job Title"] ?? r["Title"] ?? r["title"] ?? r["Position"] ?? "");
        const company = String(r["Company"] ?? r["company"] ?? r["Employer"] ?? "");
        const location = String(r["Location"] ?? r["location"] ?? r["City"] ?? "Israel");
        const source = String(r["Source"] ?? r["source"] ?? r["Platform"] ?? "Job Board");
        const fullText = Object.values(r).join(" ");

        const skillResult = scoreSkillOverlap(fullText);
        const locationResult = scoreLocation(location);
        const seniorityResult = scoreSeniority(title);

        const factors = [
          { label: "Tech Stack", score: skillResult.score, detail: skillResult.detail, icon: skillResult.score >= 70 ? "✅" : "⚠️" },
          { label: "Location", score: locationResult.score, detail: locationResult.detail, icon: locationResult.score >= 75 ? "✅" : "⚠️" },
          { label: "Seniority", score: seniorityResult.score, detail: seniorityResult.detail, icon: seniorityResult.score >= 75 ? "✅" : "⚠️" },
        ];

        const totalScore = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
        const gaps: string[] = [];
        if (skillResult.score < 60) gaps.push("Add more relevant tech skills from this job to your CV");
        if (locationResult.score < 60) gaps.push("Location is outside your preferred area");
        if (seniorityResult.score < 60) gaps.push("Role seniority doesn't match your career stage");

        return {
          id: String(i),
          title,
          company,
          location: location || "Israel",
          source,
          totalScore,
          factors,
          gaps,
          posted: postedLabel(r["Date Posted"] ?? r["Posted Date"] ?? r["date"]),
          url: String(r["URL"] ?? r["Link"] ?? r["url"] ?? ""),
        };
      })
      .filter((j) => j.title)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);

    return NextResponse.json({ total: results.length, cv_skills: CV_PROFILE.skills, matches: results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
