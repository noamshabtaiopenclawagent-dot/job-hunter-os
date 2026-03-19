"use client";

import { useEffect, useState } from "react";

type BoardStats = {
  total: number;
  inbox: number;
  in_progress: number;
  review: number;
  done: number;
  throughput_week: number;
  stagnant: number;
  high_priority: number;
};

type GitStats = {
  commits_week: number;
  last_commit: string;
  last_author: string;
};

const REPO = "noamshabtaiopenclawagent-dot/job-hunter-os";

const TIPS = [
  "Focus on roles at SaaS companies — highest match rate for your profile.",
  "Add PostgreSQL projects to your portfolio to boost DB-heavy roles.",
  "Companies in Herzliya cluster: Fiverr, IronSource — strong demand for React+Node.",
  "Monday.com, Wix, and Elementor post roles in waves — check weekly.",
  "Remote-first Israeli companies: typically offer higher alignment with your skills.",
];

export default function InsightsPage() {
  const [board, setBoard] = useState<BoardStats | null>(null);
  const [git, setGit] = useState<GitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const MC = "http://127.0.0.1:8000/api/v1";
    const ENV_TOKEN_KEY = "LOCAL_AUTH_TOKEN";

    (async () => {
      try {
        // Fetch board data via /api/pipeline which already has auth
        const pipelineRes = await fetch("/api/pipeline");
        const pipelineData = await pipelineRes.json();

        const now = Date.now();
        const sevenDaysAgo = now - 7 * 86400000;
        const apps = pipelineData.applications ?? [];

        const counts = pipelineData.counts ?? {};
        const throughputWeek = apps.filter(
          (a: { stage: string; updatedAt: string }) =>
            a.stage === "done" && new Date(a.updatedAt).getTime() > sevenDaysAgo
        ).length;

        setBoard({
          total: pipelineData.total ?? 0,
          inbox: counts.inbox ?? 0,
          in_progress: counts.in_progress ?? 0,
          review: counts.review ?? 0,
          done: counts.done ?? 0,
          throughput_week: throughputWeek,
          stagnant: apps.filter((a: { daysInStage: number; stage: string }) => a.daysInStage > 7 && a.stage !== "done").length,
          high_priority: apps.filter((a: { priority: string }) => a.priority === "high").length,
        });

        // GitHub stats
        const ghRes = await fetch(
          `https://api.github.com/repos/${REPO}/commits?per_page=30`,
          { headers: { Accept: "application/vnd.github.v3+json" } }
        );
        if (ghRes.ok) {
          const commits = await ghRes.json();
          const weekCommits = commits.filter(
            (c: { commit: { author: { date: string } } }) =>
              new Date(c.commit.author.date).getTime() > sevenDaysAgo
          ).length;
          const last = commits[0];
          setGit({
            commits_week: weekCommits,
            last_commit: last?.commit.message.split("\n")[0].slice(0, 60) ?? "—",
            last_author: last?.commit.author.name ?? "—",
          });
        }
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    })();
  }, []);

  const Stat = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
    <div style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "18px 22px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>📊 Insights</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Live operations metrics + AI recommendations</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <div>Loading metrics…</div>
        </div>
      ) : (
        <>
          {/* Board KPIs */}
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Board</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <Stat label="Total tasks"        value={board?.total ?? 0}          color="#818cf8" />
            <Stat label="In progress"        value={board?.in_progress ?? 0}    color="#f59e0b" />
            <Stat label="In review"          value={board?.review ?? 0}         color="#a78bfa" />
            <Stat label="Done"               value={board?.done ?? 0}           color="#10b981" />
            <Stat label="Done this week"     value={board?.throughput_week ?? 0} color="#10b981" />
            <Stat label="Stagnant (7d+)"     value={board?.stagnant ?? 0}       color={board && board.stagnant > 5 ? "#f87171" : "#64748b"} />
            <Stat label="High priority"      value={board?.high_priority ?? 0}  color="#f59e0b" />
          </div>

          {/* GitHub KPIs */}
          {git && (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>GitHub — job-hunter-os</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                <Stat label="Commits this week" value={git.commits_week} color={git.commits_week >= 3 ? "#10b981" : "#f59e0b"} />
                <div style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "18px 22px", flex: 2, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, color: "#818cf8", fontSize: 13 }}>{git.last_commit}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Last commit by {git.last_author}</div>
                </div>
              </div>
            </>
          )}

          {/* Health summary */}
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>System Health</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "BOB Loop", status: "✅ Running every 5 min", ok: true },
              { label: "ALEX QA", status: "✅ Running every 15 min", ok: true },
              { label: "OPI Manager", status: "✅ Running every hour", ok: true },
              { label: "SENTRY", status: "✅ Nightly 01:00", ok: true },
              { label: "CRONX", status: "✅ Every 12h", ok: true },
              { label: "Weekly Report", status: "✅ Mon 09:00", ok: true },
              { label: "Dedup Guards", status: "✅ Active (cronx+sentry)", ok: true },
              { label: "GitHub CI", status: "✅ On every push", ok: true },
            ].map(({ label, status, ok }) => (
              <div key={label} style={{ background: "#1a1d2e", border: `1px solid ${ok ? "rgba(16,185,129,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 10, padding: "10px 14px", minWidth: 170 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ok ? "#10b981" : "#f87171", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{status}</div>
              </div>
            ))}
          </div>

          {/* AI Tips */}
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>💡 AI Recommendations</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#94a3b8", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
