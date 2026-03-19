import { NextResponse } from "next/server";
import os from "os";

export const dynamic = "force-dynamic";

function cpuUsagePercent(): Promise<number> {
  return new Promise((resolve) => {
    const startMeasure = os.cpus().map((cpu) => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((a, b) => a + b, 0),
    }));

    setTimeout(() => {
      const endMeasure = os.cpus().map((cpu) => ({
        idle: cpu.times.idle,
        total: Object.values(cpu.times).reduce((a, b) => a + b, 0),
      }));

      const totals = startMeasure.map((start, i) => {
        const end = endMeasure[i];
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;
        return totalDiff > 0 ? ((1 - idleDiff / totalDiff) * 100) : 0;
      });

      const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
      resolve(Math.round(avg));
    }, 200);
  });
}

export async function GET() {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercent = Math.round((usedMem / totalMem) * 100);

    const cpuPercent = await cpuUsagePercent();

    const platform = os.platform();
    const loadAvg = os.loadavg(); // [1m, 5m, 15m]
    const uptime = Math.floor(os.uptime()); // seconds

    return NextResponse.json({
      ok: true,
      cpu: cpuPercent,
      ram: ramPercent,
      ram_total_gb: Math.round((totalMem / 1024 / 1024 / 1024) * 10) / 10,
      ram_used_gb: Math.round((usedMem / 1024 / 1024 / 1024) * 10) / 10,
      load_1m: Math.round(loadAvg[0] * 100) / 100,
      uptime_seconds: uptime,
      platform,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
