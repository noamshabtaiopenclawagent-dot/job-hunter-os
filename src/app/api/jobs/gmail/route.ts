import { NextResponse } from "next/server";
import db from "@/lib/database";
import { searchMessages, getMessage, parseBody } from "@/lib/gmail";
import { v4 as uuidv4 } from "uuid";

// Phase 15: Live Gmail Pulse Ingestion
// Connecting the Swarm to Noam's Real Inbox

export async function POST() {
  console.log("⚡ Gmail Pulse: Strategic Sourcing Initializing (LIVE)...");

  try {
    // 1. Search for real Job Alert emails (LinkedIn, Indeed, etc.)
    const query = "subject:\"job alert\" OR \"new job opportunities\"";
    const messages = await searchMessages(query, 5);

    if (messages.length === 0) {
      return NextResponse.json({ message: "Inbox quiet. No new alerts found." });
    }

    const discoveredJobs: any[] = [];

    // 2. Extract and Parse the top alerts
    for (const msgRef of messages) {
      const msg = await getMessage(msgRef.id!);
      if (!msg) continue;

      const snippet = msg.snippet || "";
      const subject = msg.payload?.headers?.find(h => h.name === "Subject")?.value || "";
      
      // Heuristic: Extract possible Company & Title from snippet
      // "New Job Alert: Product Analyst at Melio" -> [Product Analyst, Melio]
      const companyMatch = snippet.match(/at\s+([A-Z][a-zA-Z\s,]+?)(?:\s*\||\.|\s-|$)/);
      const titleMatch = subject.replace(/job\s+alert/i, "").replace(/[:\-]/g, "").trim();

      const company = companyMatch ? companyMatch[1].trim() : "LinkedIn Sourced";
      const title = titleMatch || "Strategic Role";

      discoveredJobs.push({
        id: uuidv4(),
        title,
        company,
        location: "Central Israel (Remote)",
        description: snippet,
        score: 0,
        status: "new",
        source: "Gmail (Live)",
        fit: "Analyzing...",
        posted: "Recently",
        url: "#", // Standard discovery placeholder
        tags: ["Pulse", "Ingested"]
      });
    }

    // 3. Inject into localized SQLite DB
    const insert = db.prepare(`
      INSERT OR IGNORE INTO jobs (id, title, company, location, description, score, status, source, fit, posted, url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let ingested = 0;
    for (const job of discoveredJobs) {
      const result = insert.run(
        job.id, job.title, job.company, job.location, job.description, 
        job.score, job.status, job.source, job.fit, job.posted, job.url, JSON.stringify(job.tags)
      );
      if (result.changes > 0) ingested++;
    }

    return NextResponse.json({ 
      success: true, 
      scanned: messages.length, 
      ingested,
      jobs: discoveredJobs.length 
    });

  } catch (error) {
    console.error("Gmail Pulse Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
