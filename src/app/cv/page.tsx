"use client";

import { useEffect, useState } from "react";

// Professional SVG Icons
const Icons = {
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
  )
};

export default function CVPage() {
  const [profile, setProfile] = useState({
    full_name: "",
    seniority: "Senior",
    experience_years: 0,
    skills: "",
    preferred_roles: "",
    min_salary: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cv");
        if (res.ok) setProfile(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/cv", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setMessage("✅ Profile Synchronized");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) { setMessage("❌ Save Failed"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <div className="glow-pulse" style={{ width: 40, height: 40, borderRadius: "50%", background: "hsl(var(--primary))", margin: "0 auto" }} />
      <p style={{ marginTop: 24, fontSize: 14, fontWeight: 600, color: "hsla(var(--foreground), 0.5)" }}>Decrypting Career Data...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 40, animation: "fade-in-up 0.6s ease-out", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 900, color: "hsl(var(--foreground))", letterSpacing: "-1.5px", marginBottom: 8 }}>
            <Icons.User /> Career <span style={{ color: "hsl(var(--primary))" }}>Command Center</span>
          </h1>
          <p style={{ fontSize: 16, color: "hsla(var(--foreground), 0.5)" }}>Configure your professional identity for the AI Swarm.</p>
        </div>
        {message && <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "hsl(var(--success))", animation: "fade-in-up 0.3s ease-out" }}>{message}</div>}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        
        {/* Left Column: Core Identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <section className="glass-card animate-in" style={{ padding: 32, borderRadius: 24 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: "hsla(var(--foreground), 0.4)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 24 }}>
              <Icons.Shield /> Core Intelligence
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "hsla(var(--foreground), 0.6)" }}>Full Identity</label>
                <input 
                  value={profile.full_name || ""} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  style={{ padding: "12px 16px", background: "hsla(var(--background), 0.4)", border: "1px solid hsla(var(--border), 0.5)", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "hsla(var(--foreground), 0.6)" }}>Seniority Rank</label>
                  <select 
                    value={profile.seniority || "Senior"} 
                    onChange={e => setProfile({...profile, seniority: e.target.value})}
                    style={{ padding: "12px 16px", background: "hsla(var(--background), 0.4)", border: "1px solid hsla(var(--border), 0.5)", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 14, outline: "none" }}
                  >
                    <option>Junior</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Lead / Architect</option>
                    <option>Director / VP</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "hsla(var(--foreground), 0.6)" }}>Years Active</label>
                  <input 
                    type="number"
                    value={profile.experience_years || 0} 
                    onChange={e => setProfile({...profile, experience_years: Number(e.target.value)})}
                    style={{ padding: "12px 16px", background: "hsla(var(--background), 0.4)", border: "1px solid hsla(var(--border), 0.5)", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 14, outline: "none" }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card animate-in" style={{ padding: 32, borderRadius: 24, animationDelay: "0.1s" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: "hsla(var(--foreground), 0.4)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 24 }}>
              <Icons.Zap /> Market Alignment
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "hsla(var(--foreground), 0.6)" }}>Desired Roles (Comma separated)</label>
                <textarea 
                  value={profile.preferred_roles || ""} 
                  onChange={e => setProfile({...profile, preferred_roles: e.target.value})}
                  rows={3}
                  style={{ padding: "12px 16px", background: "hsla(var(--background), 0.4)", border: "1px solid hsla(var(--border), 0.5)", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 14, outline: "none", resize: "none" }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Skills & Tech */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <section className="glass-card animate-in" style={{ padding: 32, borderRadius: 24, flex: 1, animationDelay: "0.2s" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: "hsla(var(--foreground), 0.4)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 24 }}>
              <Icons.Database /> Skill Set & Technology
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "hsla(var(--foreground), 0.6)" }}>Primary Skills</label>
              <textarea 
                value={typeof profile.skills === 'string' ? profile.skills : ""} 
                onChange={e => setProfile({...profile, skills: e.target.value})}
                placeholder="React, TypeScript, Node.js, LLMs..."
                style={{ 
                  flex: 1, minHeight: 180, padding: "16px", background: "hsla(var(--background), 0.4)", 
                  border: "1px solid hsla(var(--border), 0.5)", borderRadius: 12, color: "hsl(var(--foreground))", 
                  fontSize: 14, outline: "none", resize: "none", lineHeight: 1.6
                }}
              />
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(typeof profile.skills === 'string' ? profile.skills : "").split(",").map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.1)", padding: "4px 10px", borderRadius: 8 }}>{s}</span>
                ))}
              </div>
            </div>
          </section>

          <button 
            onClick={save}
            disabled={saving}
            className="glow-pulse"
            style={{ 
              width: "100%", padding: "18px", background: "hsl(var(--primary))", 
              color: "white", border: "none", borderRadius: 16, fontSize: 16, 
              fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {saving ? "SYNCHRONIZING..." : "SAVE & DEPLOY PROFILE"}
          </button>
        </div>

      </div>
    </div>
  );
}
