"use client";
import Link from "next/link";

const NAV = [
  { href: "/discover",  label: "🔍 Discover"  },
  { href: "/match",     label: "⚡ Match"     },
  { href: "/pipeline",  label: "📋 Pipeline"  },
  { href: "/insights",  label: "📊 Insights"  },
];

export function NavBar() {
  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 8, padding: "14px 24px",
      background: "#1a1d2e", borderBottom: "1px solid #2d3148",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, marginRight: 24, color: "#818cf8", textDecoration: "none" }}>
        🎯 Job Hunter OS
      </Link>
      {NAV.map(({ href, label }) => (
        <Link key={href} href={href} style={{
          color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 600,
          padding: "6px 14px", borderRadius: 8,
        }}>
          {label}
        </Link>
      ))}
      <div style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>
        Built by OPI Swarm · {new Date().toLocaleDateString("en-IL")}
      </div>
    </nav>
  );
}
