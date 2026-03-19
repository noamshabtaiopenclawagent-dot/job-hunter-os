"use client";
import { useState } from "react";

const APPS = [
  { id: 1, title: "Senior Software Engineer", company: "Wix", stage: "interview", daysAgo: 3, sla: 7, lastAction: "Completed technical interview", nextAction: "Await hiring decision" },
  { id: 2, title: "Full Stack Developer", company: "Monday.com", stage: "assignment", daysAgo: 1, sla: 3, lastAction: "Submitted take-home project", nextAction: "Follow up if no response by Friday" },
  { id: 3, title: "Frontend Engineer", company: "Check Point", stage: "screen", daysAgo: 0, sla: 5, lastAction: "Scheduled phone screen", nextAction: "Phone call at 3PM today" },
  { id: 4, title: "Tech Lead", company: "IronSource", stage: "applied", daysAgo: 5, sla: 14, lastAction: "Applied via LinkedIn", nextAction: "Follow up next week if silent" },
  { id: 5, title: "Backend Engineer", company: "Fiverr", stage: "rejected", daysAgo: 7, sla: 0, lastAction: "Rejected at CV screen", nextAction: "Review and improve CV based on feedback" },
];

const STAGE_MAP: Record<string, { label: string; color: string; bg: string; order: number }> = {
  applied:     { label: "Applied",     color: "#818cf8", bg: "rgba(129,140,248,0.1)", order: 1 },
  screen:      { label: "Phone Screen", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", order: 2 },
  assignment:  { label: "Assignment",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)", order: 3 },
  interview:   { label: "Interview",   color: "#a78bfa", bg: "rgba(167,139,250,0.1)", order: 4 },
  offer:       { label: "Offer",       color: "#10b981", bg: "rgba(16,185,129,0.1)", order: 5 },
  rejected:    { label: "Rejected",    color: "#f87171", bg: "rgba(248,113,113,0.1)", order: 6 },
};

export default function PipelinePage() {
  const [filter, setFilter] = useState("all");
  const active = APPS.filter(a => filter === "all" || a.stage === filter);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>📋 Applications Pipeline</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Track every application from applied to offer — with SLA clock badges</p>
      </div>
      {/* Stage filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["all", ...Object.keys(STAGE_MAP)].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
            background: filter === s ? "#6366f1" : "#1a1d2e", color: filter === s ? "white" : "#94a3b8",
            transition: "all 0.15s",
          }}>
            {s === "all" ? "All" : STAGE_MAP[s].label}
          </button>
        ))}
      </div>
      {/* Applications */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {active.map(app => {
          const stage = STAGE_MAP[app.stage];
          const slaOverdue = app.stage !== "rejected" && app.stage !== "offer" && app.daysAgo > app.sla;
          return (
            <div key={app.id} style={{ background: "#1a1d2e", border: `1px solid ${slaOverdue ? "rgba(248,113,113,0.4)" : "#2d3148"}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{app.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: stage.bg, color: stage.color, padding: "2px 10px", borderRadius: 20 }}>{stage.label}</span>
                    {slaOverdue && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(248,113,113,0.15)", color: "#f87171", padding: "2px 10px", borderRadius: 20 }}>⚠️ SLA Overdue</span>}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{app.company}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", fontSize: 12 }}>
                    <span style={{ color: "#64748b" }}>Last: <span style={{ color: "#94a3b8" }}>{app.lastAction}</span></span>
                    <span style={{ color: "#64748b" }}>Next: <span style={{ color: "#818cf8" }}>{app.nextAction}</span></span>
                  </div>
                </div>
                {/* SLA Clock Badge */}
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${slaOverdue ? "#f87171" : "#2d3148"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: slaOverdue ? "#f87171" : "#475569" }}>
                    {app.daysAgo}d
                  </div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>elapsed</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
