import { NextResponse } from "next/server";
import db, { initDb } from "@/lib/database";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  reasoning: string;
  is_remote: number;
  city: string;
  location: string;
  source: string;
  score: number;
  fit: number;
  tags: string[];
  posted: string;
  url: string;
  cover_letter: string;
  status: "new" | "seen" | "applied" | "skipped";
}

// Ensure DB is initialized
initDb();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || searchParams.get("query") || "").toLowerCase();
    const minScore = Number(searchParams.get("min_score") ?? 0);
    const remoteOnly = searchParams.get("remote") === "true";
    const limit = Number(searchParams.get("limit") ?? 100);

    // Build query
    let sql = `
      SELECT * FROM jobs 
      WHERE score >= ? 
      AND status NOT IN ('skipped')
    `;
    const params: any[] = [minScore];

    if (remoteOnly) {
      sql += ` AND is_remote = 1`;
    }

    if (query) {
      sql += ` AND (LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)`;
      const q = `%${query}%`;
      params.push(q, q, q, q);
    }

    sql += ` ORDER BY score DESC LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(sql).all(...params) as any[];

    const jobs: JobListing[] = rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || "[]")
    }));

    return NextResponse.json({ total: jobs.length, jobs });
  } catch (e) {
    console.error("[/api/jobs]", e);
    return NextResponse.json(
      { error: "Failed to fetch job data from database", detail: String(e) },
      { status: 500 }
    );
  }
}

// Support updating job status (e.g. Applied, Skipped)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const result = db.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
