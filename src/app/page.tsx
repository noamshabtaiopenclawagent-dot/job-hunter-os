"use client";
import Link from "next/link";

const CARDS = [
  {
    href: "/discover",
    icon: "🔍",
    title: "Discover",
    desc: "Scan Israeli job boards for matching opportunities in real time",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.3)",
  },
  {
    href: "/match",
    icon: "⚡",
    title: "Match & Score",
    desc: "See how your CV scores against every job — with explainability",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    href: "/pipeline",
    icon: "📋",
    title: "Pipeline",
    desc: "Track every application from applied to offer — never lose context",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
  },
  {
    href: "/insights",
    icon: "📊",
    title: "Insights",
    desc: "Understand why jobs matched or didn't — and what to improve next",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.3)",
  },
];

export default function Home() {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Job Hunter OS
        </h1>
        <p style={{ color: "#64748b", marginTop: 12, fontSize: 16, maxWidth: 480, margin: "12px auto 0" }}>
          Your autonomous job hunting platform. Powered by the OPI AI Swarm.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 32 }}>
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: "28px 24px",
              cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${c.border}`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: c.color }}>{c.title}</h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 48, padding: "20px 24px", background: "#1a1d2e", borderRadius: 12, border: "1px solid #2d3148", fontSize: 13, color: "#64748b" }}>
        <strong style={{ color: "#475569" }}>🤖 Swarm Status:</strong> BOB (builder) → ALEX (QA) → OPI (manager) · Last build: {new Date().toISOString().split("T")[0]}
      </div>
    </div>
  );
}
