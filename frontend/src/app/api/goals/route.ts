import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_DIR = path.join(process.env.HOME || "", ".openclaw", "workspace");
const GOALS_FILE = path.join(WORKSPACE_DIR, "COMPANY_GOALS.md");

const DEFAULT_GOALS = `# Company Goals & OKRs
_Last updated: ${new Date().toISOString().split("T")[0]}_

## 🎯 Q1 Objective: Lean Two-Agent Reliability
**Key Results:**
- [x] KR1: Run only OPI and Bob as autonomous agents
- [x] KR2: Keep native OpenClaw cron as the only scheduler plane
- [ ] KR3: Keep Mission Control, Discord, memory, and backups aligned with live runtime truth

## 🎯 Q2 Objective: Product Delivery
**Key Results:**
- [ ] KR1: Ship the next highest-value Job Hunter OS slice with verification
- [ ] KR2: Keep nightly backups healthy without reintroducing scheduler sprawl
`;

export async function GET() {
  try {
    let content = "";
    try {
      content = await fs.readFile(GOALS_FILE, "utf-8");
    } catch (e) {
      // If file doesn't exist, return default template
      content = DEFAULT_GOALS;
      await fs.writeFile(GOALS_FILE, content, "utf-8");
    }
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Goals fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
    
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
    await fs.writeFile(GOALS_FILE, body.content, "utf-8");
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Goals update error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
