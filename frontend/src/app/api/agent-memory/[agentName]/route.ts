import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_DIR = path.join(process.env.HOME || "", ".openclaw", "workspace");

export async function GET(
  request: NextRequest,
  { params }: { params: { agentName: string } }
) {
  try {
    const name = params.agentName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!name) return NextResponse.json({ error: "Invalid agent name" }, { status: 400 });

    const teamMemoryPath = path.join(WORKSPACE_DIR, "TEAM_MEMORY.md");
    const currentFocusPath = path.join(WORKSPACE_DIR, "workspace-agents", name, "CURRENT_FOCUS.md");

    let teamMemory = "";
    let currentFocus = "";

    try {
      teamMemory = await fs.readFile(teamMemoryPath, "utf-8");
    } catch (e) {
      teamMemory = "*(TEAM_MEMORY.md not found)*";
    }

    try {
      currentFocus = await fs.readFile(currentFocusPath, "utf-8");
    } catch (e) {
      // If the specific agent folder doesn't have it, try checking if it exists in main or is just missing.
      currentFocus = "*(CURRENT_FOCUS.md not found for this agent)*";
    }

    return NextResponse.json({ teamMemory, currentFocus }, { status: 200 });

  } catch (error) {
    console.error("Memory fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { agentName: string } }
) {
  try {
    const name = params.agentName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!name) return NextResponse.json({ error: "Invalid agent name" }, { status: 400 });

    const body = await request.json();

    if (body.teamMemory !== undefined) {
      const p = path.join(WORKSPACE_DIR, "TEAM_MEMORY.md");
      await fs.writeFile(p, body.teamMemory, "utf-8");
    }

    if (body.currentFocus !== undefined) {
      const dir = path.join(WORKSPACE_DIR, "workspace-agents", name);
      await fs.mkdir(dir, { recursive: true });
      const p = path.join(dir, "CURRENT_FOCUS.md");
      await fs.writeFile(p, body.currentFocus, "utf-8");
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Memory update error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
