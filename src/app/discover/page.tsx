"use client";

import { useEffect, useState } from "react";
import type { JobListing } from "@/app/api/jobs/route";

const scoreColor = (s: number) =>
  s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#94a3b8";

const SOURCES = ["All Sources", "LinkedIn", "Glassdoor", "Drushim", "Indeed", "AllJobs", "JobMaster"];

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All Sources");
  const [minScore, setMinScore] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = async (q = query, ms = minScore) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (ms > 0) params.set("min_score", String(ms));
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const all: JobListing[] = data.jobs ?? [];
      setJobs(
        source !== "All Sources"
          ? all.filter((j) => j.source?.toLowerCase().includes(source.toLowerCase()))
          : all
      );
      setLastRefresh(new Date());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>🔍 Discover Jobs</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Live Israeli job market data — {jobs.length} positions ranked by match score
          {lastRefresh && (
            <span style={{ marginLeft: 10, color: "#334155", fontSize: 11 }}>
              · refreshed {lastRefresh.toLocaleTimeString("he-IL")}
            </span>
          )}
        </p>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, companies, skills..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none" }}
        />
        <select
          value={source}
          onChange={(e) => { setSource(e.target.value); setTimeout(() => load(), 10); }}
          style={{ padding: "9px 14px", background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, color: "#e2e8f0", fontSize: 13 }}
        >
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={minScore}
          onChange={(e) => { setMinScore(Number(e.target.value)); setTimeout(() => load(query, Number(e.target.value)), 10); }}
          style={{ padding: "9px 14px", background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, color: "#e2e8f0", fontSize: 13 }}
        >
          <option value={0}>All Scores</option>
          <option value={70}>70+ Match</option>
          <option value={80}>80+ Match</option>
          <option value={90}>90+ Match</option>
        </select>
        <button type="submit" style={{ padding: "9px 18px", background: "#6366f1", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          🔄 Refresh
        </button>
      </form>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14 }}>Fetching Israeli job market data...</div>
          <div style={{ fontSize: 11, marginTop: 6, color: "#334155" }}>Source: github.com/benzaquenruth/data_analyst_job_postings</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: "20px 24px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
          <strong>⚠️ Could not load job data:</strong> {error}
          <div style={{ marginTop: 10 }}>
            <button onClick={() => load()} style={{ padding: "6px 14px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 12, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jobs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
              No jobs match your filters. Try broadening your search.
            </div>
          )}
          {jobs.map((job) => (
            <div key={job.id} style={{
              background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{job.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>New</span>
                </div>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                  {[job.company, job.location, job.source, job.posted].filter(Boolean).join(" · ")}
                </div>
                {job.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {job.tags.map((t) => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, background: "#0f1117", border: "1px solid #2d3148", color: "#94a3b8", padding: "2px 8px", borderRadius: 20 }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Score ring */}
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${scoreColor(job.score)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: scoreColor(job.score) }}>
                  {job.score}
                </div>
                <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>Match</div>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 13px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>Apply</a>
                ) : (
                  <button style={{ padding: "7px 13px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Apply</button>
                )}
                <button style={{ padding: "7px 13px", background: "transparent", border: "1px solid #2d3148", borderRadius: 8, color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>Skip</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
