"use client";

import { useEffect, useState } from "react";
import type { Application } from "@/app/api/pipeline/route";

const STAGE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  applied:     { label: "Applied",      color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  screen:      { label: "Phone Screen", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  assignment:  { label: "Assignment",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  interview:   { label: "Interview",    color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  offer:       { label: "Offer",        color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  rejected:    { label: "Rejected",     color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  in_progress: { label: "In Progress",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  review:      { label: "In Review",    color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  done:        { label: "Done",         color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
};

type PipelineData = {
  total: number;
  counts: Record<string, number>;
  applications: Application[];
};

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const apps = data?.applications ?? [];
  const filtered = filter === "all" ? apps : apps.filter((a) => a.stage === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>📋 Applications Pipeline</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Live data from Mission Control — {data?.total ?? 0} active tasks
        </p>
      </div>

      {/* KPI counts */}
      {data && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(data.counts).filter(([, v]) => v > 0).map(([k, v]) => {
            const s = STAGE_MAP[k] ?? { label: k, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
            return (
              <button key={k} onClick={() => setFilter(filter === k ? "all" : k)} style={{
                padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === k ? s.color : "#2d3148"}`,
                background: filter === k ? s.bg : "#1a1d2e", color: filter === k ? s.color : "#94a3b8",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
                {s.label}: {v}
              </button>
            );
          })}
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: 20, background: "transparent", border: "1px solid #475569", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
              Clear filter
            </button>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <div>Loading pipeline from Mission Control…</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: "16px 20px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
          <strong>⚠️ Failed to load pipeline:</strong> {error}
          <button onClick={load} style={{ marginLeft: 12, padding: "4px 12px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 12, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>No tasks in this stage.</div>}
          {filtered.map((app) => {
            const s = STAGE_MAP[app.stage] ?? STAGE_MAP.in_progress;
            const slaWarn = app.daysInStage > 7 && app.stage !== "done";
            return (
              <div key={app.id} style={{ background: "#1a1d2e", border: `1px solid ${slaWarn ? "rgba(248,113,113,0.35)" : "#2d3148"}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{app.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, padding: "2px 9px", borderRadius: 20 }}>{s.label}</span>
                    {slaWarn && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(248,113,113,0.12)", color: "#f87171", padding: "2px 9px", borderRadius: 20 }}>⚠️ {app.daysInStage}d stagnant</span>}
                    {app.priority === "high" && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "2px 9px", borderRadius: 20 }}>High Priority</span>}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{app.company} · Updated {new Date(app.updatedAt).toLocaleDateString("he-IL")}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", border: `2px solid ${slaWarn ? "#f87171" : "#2d3148"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: slaWarn ? "#f87171" : "#475569" }}>
                    {app.daysInStage}d
                  </div>
                  <div style={{ fontSize: 9, color: "#334155", marginTop: 3 }}>in stage</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
