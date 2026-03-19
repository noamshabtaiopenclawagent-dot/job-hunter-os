export default function MatchPage() {
  const MATCHES = [
    {
      title: "Senior Software Engineer", company: "Wix", score: 94, verdict: "Strong Match",
      verdictColor: "#10b981", verdictBg: "rgba(16,185,129,0.1)",
      factors: [
        { label: "Tech Stack", score: 98, detail: "React, TypeScript, Node.js — perfect overlap", icon: "✅" },
        { label: "Experience Level", score: 92, detail: "5+ years required, 6 years CV", icon: "✅" },
        { label: "Domain Knowledge", score: 88, detail: "SaaS product experience matches", icon: "✅" },
        { label: "Location", score: 100, detail: "Tel Aviv — matches preference", icon: "✅" },
        { label: "Seniority", score: 90, detail: "Senior IC role aligns with career stage", icon: "✅" },
      ],
      gaps: ["No Kubernetes experience mentioned in CV — consider adding"],
    },
    {
      title: "Tech Lead", company: "IronSource", score: 79, verdict: "Partial Match",
      verdictColor: "#f59e0b", verdictBg: "rgba(245,158,11,0.1)",
      factors: [
        { label: "Tech Stack", score: 62, detail: "Scala/Kafka — not on CV", icon: "⚠️" },
        { label: "Experience Level", score: 90, detail: "7 years required, 6 years CV — minor gap", icon: "⚠️" },
        { label: "Domain Knowledge", score: 84, detail: "Ad-tech adjacent experience", icon: "✅" },
        { label: "Location", score: 100, detail: "Tel Aviv — matches", icon: "✅" },
        { label: "Leadership", score: 80, detail: "Team lead mentioned but brief", icon: "⚠️" },
      ],
      gaps: ["Add Kafka or streaming systems to CV", "Expand team leadership section"],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>⚡ Match & Score</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Explainable CV scoring — understand exactly why each job matched or didn{"'"}t</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {MATCHES.map(job => (
          <div key={job.title} style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>{job.title}</h2>
                <span style={{ color: "#64748b", fontSize: 14 }}>{job.company}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: job.verdictColor }}>{job.score}</span>
                <span style={{ background: job.verdictBg, color: job.verdictColor, padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{job.verdict}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {job.factors.map(f => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 20, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ width: 140, fontSize: 13, fontWeight: 600, color: "#94a3b8", flexShrink: 0 }}>{f.label}</span>
                  <div style={{ flex: 1, height: 6, background: "#0f1117", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${f.score}%`, background: f.score >= 85 ? "#10b981" : f.score >= 70 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                  </div>
                  <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: "#64748b", textAlign: "right" }}>{f.score}</span>
                  <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{f.detail}</span>
                </div>
              ))}
            </div>
            {job.gaps.length > 0 && (
              <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 CV Improvements</div>
                {job.gaps.map(g => <div key={g} style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>• {g}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
