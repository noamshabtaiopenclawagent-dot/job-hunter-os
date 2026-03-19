"use client";

import { useEffect, useState } from "react";
import type { MatchedJob } from "@/app/api/match/route";

const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#f87171";
const verdictLabel = (s: number) => s >= 80 ? "Strong Match" : s >= 60 ? "Partial Match" : "Weak Match";
const verdictBg = (s: number) => s >= 80 ? "rgba(16,185,129,0.1)" : s >= 60 ? "rgba(245,158,11,0.1)" : "rgba(248,113,113,0.1)";

type MatchData = { total: number; cv_skills: string[]; matches: MatchedJob[] };

export default function MatchPage() {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/match");
        if (!res.ok) throw new Error(`API ${res.status}`);
        setData(await res.json());
      } catch (e) { setError(String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>⚡ Match & Score</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          CV scored against real Israeli job market — top {data?.total ?? "…"} matches
        </p>
      </div>

      {/* CV skills strip */}
      {data?.cv_skills && (
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Your CV skills:</span>
          {data.cv_skills.map((s) => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", padding: "2px 10px", borderRadius: 20 }}>{s}</span>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>
          <div style={{ fontSize: 14 }}>Scoring your CV against Israeli job market…</div>
          <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Analyzing {data?.total ?? "hundreds of"} positions</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: "16px 20px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, color: "#f87171", fontSize: 13 }}>
          <strong>⚠️ Could not load match data:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(data?.matches ?? []).map((job) => (
            <div key={job.id} style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 16, overflow: "hidden" }}>
              {/* Header row */}
              <div
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", gap: 12 }}
                onClick={() => setExpanded(expanded === job.id ? null : job.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 3 }}>{job.title}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{[job.company, job.location, job.source, job.posted].filter(Boolean).join(" · ")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ background: verdictBg(job.totalScore), color: scoreColor(job.totalScore), padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{verdictLabel(job.totalScore)}</span>
                  <span style={{ fontSize: 26, fontWeight: 900, color: scoreColor(job.totalScore) }}>{job.totalScore}</span>
                  <span style={{ color: "#475569", fontSize: 18 }}>{expanded === job.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === job.id && (
                <div style={{ borderTop: "1px solid #2d3148", padding: "16px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: job.gaps.length > 0 ? 14 : 0 }}>
                    {job.factors.map((f) => (
                      <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 20, flexShrink: 0 }}>{f.icon}</span>
                        <span style={{ width: 110, fontSize: 12, fontWeight: 600, color: "#94a3b8", flexShrink: 0 }}>{f.label}</span>
                        <div style={{ flex: 1, height: 5, background: "#0f1117", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${f.score}%`, background: scoreColor(f.score), borderRadius: 3, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ width: 28, fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "right" }}>{f.score}</span>
                        <span style={{ fontSize: 11, color: "#475569", flex: 1, minWidth: 0 }}>{f.detail}</span>
                      </div>
                    ))}
                  </div>
                  {job.gaps.length > 0 && (
                    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 CV Improvements</div>
                      {job.gaps.map((g) => <div key={g} style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>• {g}</div>)}
                    </div>
                  )}
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 12, padding: "6px 14px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      Apply →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
