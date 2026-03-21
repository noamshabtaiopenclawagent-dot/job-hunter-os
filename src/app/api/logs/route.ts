import { NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET() {
  try {
    const logs = db.prepare(`
      SELECT id, type, msg, created_at as time 
      FROM system_logs 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all();

    // Format time for the UI (HH:mm)
    const formattedLogs = logs.map((l: any) => ({
      ...l,
      time: new Date(l.time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
