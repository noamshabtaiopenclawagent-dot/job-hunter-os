import { NextResponse } from "next/server";
import db from "@/lib/database";
import { searchMessages, getMessage } from "@/lib/gmail";

// Phase 15: Live Status Sentinel
// The "Zero-Touch" Tracking Brain

interface Job {
  id: string;
  company: string;
  status: string;
}

export async function POST() {
  console.log("🕵️ Sentinel Initializing: Inbound Live Update Scan...");

  try {
    // 1. Fetch active pipeline participants
    const activeJobs = db.prepare(`
      SELECT id, company, status FROM jobs 
      WHERE status IN ('applied', 'review', 'screen', 'interview')
    `).all() as Job[];

    if (activeJobs.length === 0) {
      db.prepare("INSERT INTO system_logs (type, msg) VALUES (?, ?)").run("info", "Sentinel Pulse: Pipeline idle. No active apps to monitor.");
      return NextResponse.json({ message: "Pipeline idle. No active applications to monitor." });
    }

    let updates = 0;
    const logStrings: string[] = [];

    db.prepare("INSERT INTO system_logs (type, msg) VALUES (?, ?)").run("info", `Sentinel Scanned ${activeJobs.length} active application signals.`);

    // 2. Scan Gmail for each active company
    for (const job of activeJobs) {
      const query = `from:${job.company.toLowerCase()} OR "${job.company}" application`;
      const messages = await searchMessages(query, 3);

      if (messages.length === 0) continue;

      for (const msgRef of messages) {
        const msg = await getMessage(msgRef.id!);
        if (!msg) continue;

        const snippet = (msg.snippet || "").toLowerCase();
        
        let newStatus = "";
        let logType: "success" | "warning" | "info" = "info";
        let logMsg = "";

        if (snippet.includes("unfortunately") || snippet.includes("moving forward with other")) {
          newStatus = "rejected";
          logType = "warning";
          logMsg = `REJECTION detected for ${job.company}. Moving to Archive.`;
        } else if (snippet.includes("interview") || snippet.includes("schedule") || snippet.includes("call")) {
          newStatus = "interview";
          logType = "success";
          logMsg = `INTERVIEW SIGNAL detected for ${job.company}. High Alert.`;
        } else if (snippet.includes("offer") || snippet.includes("contract")) {
          newStatus = "offer";
          logType = "success";
          logMsg = `OFFER SIGNAL detected for ${job.company}! Success Swarm engaged.`;
        }

        if (newStatus && newStatus !== job.status) {
          db.prepare(`
            UPDATE jobs 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run(newStatus, job.id);
          
          db.prepare("INSERT INTO system_logs (type, msg) VALUES (?, ?)").run(logType, logMsg);
          logStrings.push(logMsg);
          updates++;
          break;
        }
      }
    }

    if (updates === 0) {
      db.prepare("INSERT INTO system_logs (type, msg) VALUES (?, ?)").run("info", "Sentinel Pulse: No status changes detected in this cycle.");
    }

    return NextResponse.json({ 
      success: true, 
      scanned: activeJobs.length,
      updates,
      log: logStrings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Sentinel Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
