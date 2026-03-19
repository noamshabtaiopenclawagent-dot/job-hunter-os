export default function InsightsPage() {
  const STATS = [
    { label: "Jobs Scanned", value: "247", delta: "+38 this week", color: "#818cf8" },
    { label: "Applications", value: "12",  delta: "+4 this week",  color: "#60a5fa" },
    { label: "Avg Match Score", value: "81%", delta: "↑6pts",     color: "#10b981" },
    { label: "Interviews", value: "3",    delta: "2 pending",     color: "#f59e0b" },
  ];

  const SKILL_GAPS = [
    { skill: "Kubernetes", demand: 78, gap: true, jobs: 34 },
    { skill: "GraphQL",    demand: 65, gap: true, jobs: 22 },
    { skill: "React",      demand: 95, gap: false, jobs: 87 },
    { skill: "TypeScript", demand: 91, gap: false, jobs: 79 },
    { skill: "Kafka",      demand: 55, gap: true, jobs: 18 },
  ];

  const TIPS = [
    "Add Kubernetes experience to CV — appears in 34 open roles you partially match",
    "Your response rate improves by ~30% when applying within 24h of posting",
    "Companies responding fastest right now: Wix, Fiverr, Elementor",
    "Optimize CV headline — current one scores 62/100 on ATS scanners",
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>📊 Insights</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Why jobs matched or didn{"'"}t — and exactly what to improve next</p>
      </div>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "20px 18px" }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Skill Demand Chart */}
        <div style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "20px 20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🛠 Skill Demand vs Your CV</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SKILL_GAPS.map(sk => (
              <div key={sk.skill}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: sk.gap ? "#f87171" : "#94a3b8" }}>
                    {sk.skill} {sk.gap ? "⚠️ Missing" : "✅"}
                  </span>
                  <span style={{ color: "#475569" }}>{sk.jobs} jobs</span>
                </div>
                <div style={{ height: 6, background: "#0f1117", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${sk.demand}%`, background: sk.gap ? "#f87171" : "#10b981", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* AI Tips */}
        <div style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "20px 20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>💡 AI Recommendations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.15)" }}>
                <span style={{ flexShrink: 0, color: "#818cf8", fontWeight: 700 }}>#{i + 1}</span>
                <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
