"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  MemoryStick,
  ServerCrash,
  Wifi,
  WifiOff,
} from "lucide-react";

type HealthData = {
  ok: boolean;
  cpu: number;
  ram: number;
  ram_total_gb: number;
  ram_used_gb: number;
  load_1m: number;
  uptime_seconds: number;
  platform: string;
  timestamp: string;
};

type GatewayStatus = "online" | "offline" | "unknown";

type Props = {
  gatewayConnected?: boolean;
};

function colorForPercent(pct: number): string {
  if (pct >= 90) return "text-red-600";
  if (pct >= 70) return "text-amber-500";
  return "text-emerald-600";
}

function bgForPercent(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-amber-400";
  return "bg-emerald-500";
}

function MiniBar({ percent }: { percent: number }) {
  return (
    <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${bgForPercent(percent)}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  tone,
  bar,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
  bar?: number;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="hidden text-slate-500 sm:inline">{label}</span>
      <span className={`font-semibold tabular-nums ${tone ?? "text-slate-800"}`}>
        {value}
      </span>
      {bar !== undefined && <MiniBar percent={bar} />}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h`;
  return `${Math.floor(seconds / 60)}m`;
}

export function SystemHealthStrip({ gatewayConnected }: Props) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);

  const gatewayStatus: GatewayStatus =
    gatewayConnected === undefined
      ? "unknown"
      : gatewayConnected
        ? "online"
        : "offline";

  useEffect(() => {
    let mounted = true;

    async function fetchHealth() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        const data: HealthData = await res.json();
        if (mounted) {
          setHealth(data);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 20_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50 px-4 py-1.5 scrollbar-none">
      {/* Gateway status */}
      <Pill
        icon={
          gatewayStatus === "online" ? (
            <Wifi size={12} />
          ) : (
            <WifiOff size={12} />
          )
        }
        label="Gateway"
        value={
          gatewayStatus === "unknown"
            ? "Checking…"
            : gatewayStatus === "online"
              ? "Online"
              : "Offline"
        }
        tone={
          gatewayStatus === "online"
            ? "text-emerald-600"
            : gatewayStatus === "offline"
              ? "text-red-600"
              : "text-slate-400"
        }
      />

      {/* Divider */}
      <div className="h-4 w-px shrink-0 bg-slate-200" />

      {/* OS metrics */}
      {error ? (
        <Pill
          icon={<ServerCrash size={12} />}
          label="System"
          value="Unavailable"
          tone="text-slate-400"
        />
      ) : health ? (
        <>
          <Pill
            icon={<Cpu size={12} />}
            label="CPU"
            value={`${health.cpu}%`}
            tone={colorForPercent(health.cpu)}
            bar={health.cpu}
          />
          <Pill
            icon={<MemoryStick size={12} />}
            label="RAM"
            value={`${health.ram_used_gb}GB / ${health.ram_total_gb}GB`}
            tone={colorForPercent(health.ram)}
            bar={health.ram}
          />
          <Pill
            icon={<Activity size={12} />}
            label="Load"
            value={String(health.load_1m)}
          />
          <Pill
            icon={
              <span className="text-[10px] font-mono text-slate-400">↑</span>
            }
            label="Uptime"
            value={formatUptime(health.uptime_seconds)}
          />
        </>
      ) : (
        <span className="animate-pulse text-xs text-slate-400">
          Reading metrics…
        </span>
      )}

      {/* Spacer + live pulse dot */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-400">Live</span>
      </div>
    </div>
  );
}
