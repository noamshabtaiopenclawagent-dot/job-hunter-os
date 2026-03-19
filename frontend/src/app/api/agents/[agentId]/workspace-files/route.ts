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

  const results: Record<string, string | null> = {};

  // Try main workspace (for the gateway/main agent)
  const mainWorkspace = path.join(OPENCLAW_DIR, "workspace");
  // Try sub-agent workspace: workspace-mc-{agentId}
  const subWorkspace = path.join(
    OPENCLAW_DIR,
    `workspace`,
    `workspace-mc-${agentId}`,
  );
  // Also try at the same level as workspace/
  const siblingWorkspace = path.join(
    OPENCLAW_DIR,
    `workspace-mc-${agentId}`,
  );

  // Pick the workspace that exists
  let workspaceDir: string;
  if (fs.existsSync(subWorkspace)) {
    workspaceDir = subWorkspace;
  } else if (fs.existsSync(siblingWorkspace)) {
    workspaceDir = siblingWorkspace;
  } else {
    // Fall back to main workspace (for OPI/gateway agent)
    workspaceDir = mainWorkspace;
  }

  for (const file of MEMORY_FILES) {
    const filePath = path.join(workspaceDir, file);
    results[file] = readFileIfExists(filePath);
  }

  const hasAnyContent = Object.values(results).some((v) => v !== null);

  return NextResponse.json({
    ok: true,
    agentId,
    workspaceDir,
    files: results,
    hasContent: hasAnyContent,
  });
}
