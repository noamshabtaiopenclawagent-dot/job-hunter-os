"use client";
export default function DiscoverPage() {
  const JOBS = [
    { id: 1, title: "Senior Software Engineer", company: "Wix", location: "Tel Aviv", source: "LinkedIn", score: 94, tags: ["React", "Node.js", "TypeScript"], posted: "2h ago", status: "new" },
    { id: 2, title: "Full Stack Developer", company: "Monday.com", location: "Tel Aviv", source: "Glassdoor", score: 88, tags: ["Vue", "Python", "AWS"], posted: "5h ago", status: "new" },
    { id: 3, title: "Frontend Engineer", company: "Check Point", location: "Herzliya", source: "Drushim", score: 82, tags: ["React", "CSS", "Webpack"], posted: "Yesterday", status: "seen" },
    { id: 4, title: "Tech Lead", company: "IronSource", location: "Tel Aviv", source: "Indeed", score: 79, tags: ["Scala", "Kafka", "Kubernetes"], posted: "Yesterday", status: "seen" },
    { id: 5, title: "Backend Engineer", company: "Fiverr", location: "Tel Aviv", source: "LinkedIn", score: 71, tags: ["Ruby", "Rails", "PostgreSQL"], posted: "2 days ago", status: "applied" },
  ];

  const scoreColor = (s: number) => s >= 90 ? "#10b981" : s >= 75 ? "#f59e0b" : "#94a3b8";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>🔍 Discover Jobs</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Live feed from Israeli job boards — ranked by your CV match score</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input placeholder="Search jobs, companies, skills..." style={{ flex: 1, padding: "10px 16px", background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none" }} />
        <select style={{ padding: "10px 16px", background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 10, color: "#e2e8f0", fontSize: 14 }}>
          <option>All Sources</option>
          <option>LinkedIn</option>
          <option>Glassdoor</option>
          <option>Drushim</option>
          <option>Indeed</option>
        </select>
        <button style={{ padding: "10px 20px", background: "#6366f1", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          🔄 Scan Now
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {JOBS.map(job => (
          <div key={job.id} style={{ background: "#1a1d2e", border: "1px solid #2d3148", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{job.title}</span>
                {job.status === "new" && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>New</span>}
                {job.status === "applied" && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>Applied</span>}
              </div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>{job.company} · {job.location} · {job.source} · {job.posted}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {job.tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, background: "#0f1117", border: "1px solid #2d3148", color: "#94a3b8", padding: "3px 10px", borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${scoreColor(job.score)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: scoreColor(job.score) }}>
                {job.score}
              </div>
              <span style={{ fontSize: 10, color: "#475569" }}>Match</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button style={{ padding: "8px 14px", background: "#6366f1", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Apply</button>
              <button style={{ padding: "8px 14px", background: "transparent", border: "1px solid #2d3148", borderRadius: 8, color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>Skip</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
