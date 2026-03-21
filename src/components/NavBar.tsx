"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Professional SVG Icons
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
};

const NAV = [
  { href: "/discover",  label: "Discover", Icon: Icons.Search },
  { href: "/match",     label: "Match",    Icon: Icons.Sparkles },
  { href: "/pipeline",  label: "Pipeline", Icon: Icons.Briefcase },
  { href: "/insights",  label: "Insights", Icon: Icons.Chart },
  { href: "/cv",        label: "My CV",    Icon: Icons.User },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav" style={{
      display: "flex", alignItems: "center", gap: 12, padding: "16px 32px",
      position: "sticky", top: 0, zIndex: 1000,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 24 }}>
        <Link href="/" style={{ 
          fontWeight: 900, fontSize: 20, letterSpacing: "-1.5px", 
          color: "hsl(var(--primary))", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 10 
        }}>
          <Icons.Logo />
          <span style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>JOBHUNTER OS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "hsla(var(--success), 0.1)", padding: "2px 8px", borderRadius: 20, border: "1px solid hsla(var(--success), 0.2)" }}>
          <div className="glow-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "hsl(var(--success))" }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: "hsl(var(--success))", textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Active</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {NAV.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 8,
              color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))",
              opacity: isActive ? 1 : 0.6,
              textDecoration: "none", fontSize: 13, fontWeight: 600,
              padding: "8px 16px", borderRadius: 12,
              background: isActive ? "hsla(var(--primary), 0.1)" : "transparent",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "hsla(var(--foreground), 0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Built by OPI Swarm
        </div>
      </div>
    </nav>
  );
}
