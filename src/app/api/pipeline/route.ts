import { NextResponse } from "next/server";
import db from "@/lib/database";

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

export async function GET() {
  console.log("📊 Syncing Pipeline with Local Database...");

  try {
    // 1. Fetch all jobs that are in the pipeline (status != 'new')
    const jobs = db.prepare(`
      SELECT * FROM jobs 
      WHERE status != 'new' 
      ORDER BY updated_at DESC
    `).all();

    const now = Date.now();

    const applications: Application[] = jobs.map((t: any) => {
      const updatedAt = new Date(t.updated_at).getTime() || now;
      const createdAt = new Date(t.created_at).getTime() || now;

      return {
        id: t.id,
        title: t.title,
        company: t.company,
        stage: t.status as Application["stage"],
        priority: t.score >= 90 ? "high" : "medium",
        daysInStage: Math.max(0, Math.floor((now - updatedAt) / 86400000)),
        lastAction: t.reasoning ? t.reasoning.slice(0, 100) + "..." : "Application submitted.",
        updatedAt: t.updated_at,
        createdAt: t.created_at,
      };
    });

    // 2. Aggregate counts for the UI filter bar
    const counts = applications.reduce(
      (acc, a) => {
        const k = a.stage as keyof typeof acc;
        if (k in acc) acc[k]++;
        return acc;
      },
      { in_progress: 0, review: 0, done: 0, applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0, assignment: 0 }
    );

    const discoveredCount = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'new'").get() as { count: number };

    return NextResponse.json({ 
      total: applications.length,
      discovered: discoveredCount.count,
      counts, 
      applications 
    });

  } catch (error) {
    console.error("Pipeline Sync Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
