import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR =
  process.env.OPENCLAW_DIR ??
  path.join(process.env.HOME ?? "/root", ".openclaw");

const MEMORY_FILES = [
  "MEMORY.md",
  "SOUL.md",
  "CURRENT_FOCUS.md",
  "IDENTITY.md",
  "HEARTBEAT.md",
  "AGENTS.md",
  "TEAM_MEMORY.md",
  "ROSTER.md",
];

const CANONICAL_WORKSPACES: Record<string, string> = {
  main: path.join(OPENCLAW_DIR, "workspace"),
  opi: path.join(OPENCLAW_DIR, "workspace"),
  bob: path.join(OPENCLAW_DIR, "workspace", "workspace-agents", "bob"),
};

function readFileIfExists(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await context.params;
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }
  const normalizedAgentId = agentId.trim().toLowerCase();
  const workspaceDir = CANONICAL_WORKSPACES[normalizedAgentId];
  if (!workspaceDir) {
    return NextResponse.json({ error: "unknown canonical agent" }, { status: 404 });
  }

  const results: Record<string, string | null> = {};

  for (const file of MEMORY_FILES) {
    const filePath = path.join(workspaceDir, file);
    results[file] = readFileIfExists(filePath);
  }

  const hasAnyContent = Object.values(results).some((v) => v !== null);

  return NextResponse.json({
    ok: true,
    agentId: normalizedAgentId,
    workspaceDir,
    files: results,
    hasContent: hasAnyContent,
  });
}
