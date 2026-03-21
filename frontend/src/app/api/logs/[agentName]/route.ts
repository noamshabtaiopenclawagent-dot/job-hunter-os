import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentName: string }> }
) {
  try {
    const resolvedParams = await params;
    const name = resolvedParams.agentName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!name) return NextResponse.json({ lines: [], error: "Invalid agent name" }, { status: 400 });

    const logsDir = path.join(process.env.HOME || "", ".openclaw", "workspace", "local", "state");
    // Find latest modified log file containing the agent's name
    const cmd = `ls -t ${logsDir}/${name}*.log ${logsDir}/${name}*.err.log 2>/dev/null | head -1`;
    
    try {
      const { stdout: fileStdout } = await execAsync(cmd);
      const logFile = fileStdout.trim();
      
      if (!logFile) {
        return NextResponse.json({ lines: ["No log files found for this agent."], file: null }, { status: 200 });
      }

      // Tail last 100 lines
      const { stdout: logStdout } = await execAsync(`tail -n 100 "${logFile}"`);
      const lines = logStdout.split("\n").filter(Boolean);

      return NextResponse.json({ 
        lines: lines.length ? lines : ["Log file is empty."], 
        file: path.basename(logFile) 
      }, { status: 200 });

    } catch (e: any) {
      if (e.stderr?.includes("No such file")) {
        return NextResponse.json({ lines: ["No logs available yet."], file: null }, { status: 200 });
      }
      throw e;
    }

  } catch (error) {
    console.error("Log fetch error:", error);
    return NextResponse.json({ lines: ["Error reading logs"], error: String(error) }, { status: 500 });
  }
}
