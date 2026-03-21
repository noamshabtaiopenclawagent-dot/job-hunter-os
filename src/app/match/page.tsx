"use client";

import { useEffect, useState } from "react";

// Professional SVG Icons for Match Dashboard
const Icons = {
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  ),
  Zap: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  Briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  Target: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  Globe: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  ),
  Brain: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5 5 0 0 1 12 8v4"/><path d="M14.5 2A5 5 0 0 0 12 8"/><path d="M12 12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/><path d="M12 12v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7"/></svg>
  ),
  External: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  ),
  ZapSmall: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  )
};

const getScoreColor = (s: number) => {
  if (s >= 80) return "hsl(var(--success))";
  if (s >= 60) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
};

// Map factor labels to Icons
const getFactorIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("tech") || l.includes("skill")) return <Icons.Zap />;
  if (l.includes("experience") || l.includes("roles")) return <Icons.Briefcase />;
  if (l.includes("culture") || l.includes("location")) return <Icons.Globe />;
  return <Icons.Target />;
};

type MatchedJob = {
  id: string;
  title: string;
  company: string;
  description: string;
  reasoning: string;
  location: string;
  source: string;
  totalScore: number;
  factors: { label: string; score: number; detail: string; icon: string }[];
  gaps: string[];
  posted: string;
  url: string;
  isAiScored?: boolean;
};

type MatchData = { total: number; cv_skills: string[]; matches: MatchedJob[] };

export default function MatchPage() {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/match");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const result = await res.json();
      // Filter out applied/skipped
      setData(result);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleAction = async (id: string, status: 'applied' | 'skipped', url?: string) => {
    setLoadingAction(id);
    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (url && status === 'applied') window.open(url, '_blank');
      // Update local state
      if (data) {
        setData({
          ...data,
          matches: data.matches.filter(m => m.id !== id)
        });
      }
    } catch (e) {
      console.error("Action failed", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuickApply = async (id: string, url: string) => {
    setLoadingAction(id);
    try {
      const link = document.createElement('a');
      link.href = '/api/cv/pdf';
      link.download = 'Noam_Shabtai_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await handleAction(id, 'applied', url);
    } catch (e) {
      console.error("Quick Apply failed", e);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 40, animation: "fade-in-up 0.6s ease-out" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 900, color: "hsl(var(--foreground))", letterSpacing: "-1.5px", marginBottom: 12 }}>
          <Icons.Zap /> Intelligence <span style={{ color: "hsl(var(--primary))" }}>Ranking</span>
        </h1>
        <p style={{ fontSize: 16, color: "hsla(var(--foreground), 0.6)", maxWidth: 600, lineHeight: 1.6 }}>
          Our AI Swarm has analyzed the market against your professional profile. 
          Here are the top opportunities prioritized for you.
        </p>
      </header>

      {/* Profile Context */}
      {data?.cv_skills && (
        <div className="glass-card" style={{ marginBottom: 32, padding: "16px 24px", borderRadius: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "hsla(var(--foreground), 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
            <Icons.Target /> Target Profile:
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.cv_skills.map((s) => (
              <span key={s} style={{ 
                fontSize: 11, fontWeight: 700, background: "hsla(var(--primary), 0.1)", 
                color: "hsl(var(--primary))", padding: "4px 12px", borderRadius: 10,
                border: "1px solid hsla(var(--primary), 0.2)"
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div className="glow-pulse" style={{ width: 48, height: 48, borderRadius: "50%", background: "hsl(var(--primary))", margin: "0 auto 24px" }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--foreground))" }}>Synthesizing Match Data...</h2>
          <p style={{ fontSize: 14, color: "hsla(var(--foreground), 0.5)", marginTop: 8 }}>Cross-referencing hundreds of Israeli job listings with Gemini 2.0</p>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: 24, border: "1px solid hsla(var(--destructive), 0.3)", borderRadius: 16 }}>
          <h2 style={{ color: "hsl(var(--destructive))", fontSize: 18, fontWeight: 700 }}>Initialization Error</h2>
          <p style={{ color: "hsla(var(--destructive), 0.7)", marginTop: 8 }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data?.matches.map((job, i) => (
            <div 
              key={job.id} 
              className="glass-card animate-in"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                borderRadius: 24, padding: 0, overflow: "hidden",
                border: job.isAiScored ? "1px solid hsla(var(--primary), 0.4)" : "1px solid hsla(var(--border), 0.5)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div 
                onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                style={{ padding: "24px 32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "hsl(var(--foreground))", margin: 0 }}>{job.title}</h3>
                    {job.isAiScored && (
                      <span style={{ 
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: 9, fontWeight: 900, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))", 
                        color: "white", padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.5px" 
                      }}>
                        <Icons.Sparkles /> AI ANALYZED
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "hsla(var(--foreground), 0.5)", fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: "hsla(var(--foreground), 0.8)" }}>{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span style={{ fontSize: 12, background: "hsla(var(--foreground), 0.05)", padding: "2px 8px", borderRadius: 4 }}>{job.posted}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: getScoreColor(job.totalScore), lineHeight: 1 }}>{job.totalScore}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.6, textTransform: "uppercase", marginTop: 4 }}>Match Score</div>
                  </div>
                  <div style={{ fontSize: 20, color: "hsla(var(--foreground), 0.3)" }}>
                    {expanded === job.id ? "−" : "+"}
                  </div>
                </div>
              </div>

              {expanded === job.id && (
                <div style={{ padding: "0 32px 32px 32px", borderTop: "1px solid hsla(var(--border), 0.3)", background: "hsla(var(--background), 0.4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: "hsla(var(--foreground), 0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Decision Factors</h4>
                      {job.factors.map((f) => (
                        <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: "hsla(var(--foreground), 0.4)" }}>{getFactorIcon(f.label)}</span>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{f.label}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: getScoreColor(f.score) }}>{f.score}%</span>
                          </div>
                          <div style={{ height: 6, background: "hsla(var(--foreground), 0.05)", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ 
                              height: "100%", width: `${f.score}%`, 
                              background: getScoreColor(f.score), 
                              boxShadow: `0 0 10px ${getScoreColor(f.score)}44`,
                              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" 
                            }} />
                          </div>
                          <p style={{ fontSize: 12, color: "hsla(var(--foreground), 0.5)", margin: 0 }}>{f.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {/* Strategic Reasoning block */}
                      {job.reasoning && (
                        <div style={{ 
                          background: "hsla(var(--primary), 0.05)", border: "1px solid hsla(var(--primary), 0.2)", 
                          borderRadius: 16, padding: "20px" 
                        }}>
                          <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900, color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                            <Icons.Sparkles /> Strategic Reasoning
                          </h4>
                          <p style={{ fontSize: 13, color: "hsla(var(--foreground), 0.8)", lineHeight: 1.6, margin: 0 }}>
                            {job.reasoning}
                          </p>
                        </div>
                      )}

                      {job.gaps.length > 0 && !job.reasoning && (
                        <div style={{ 
                          background: "hsla(var(--warning), 0.05)", border: "1px solid hsla(var(--warning), 0.2)", 
                          borderRadius: 16, padding: "20px" 
                        }}>
                          <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900, color: "hsl(var(--warning))", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                            <Icons.Brain /> Actionable Advice
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {job.gaps.map((g, i) => (
                              <div key={i} style={{ fontSize: 13, color: "hsla(var(--foreground), 0.8)", display: "flex", gap: 10 }}>
                                <span style={{ color: "hsl(var(--warning))" }}>→</span>
                                <span>{g}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
                        <button 
                          onClick={() => handleQuickApply(job.id, job.url)}
                          disabled={!!loadingAction}
                          className="glow-pulse"
                          style={{ 
                            flex: 1.5, padding: "14px", background: "hsl(var(--success))", 
                            color: "white", border: "none", borderRadius: 12, 
                            fontWeight: 800, fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                          }}
                        >
                          <Icons.ZapSmall /> {loadingAction === job.id ? "..." : "⚡ QUICK APPLY"}
                        </button>
                        <button 
                          onClick={() => handleAction(job.id, 'applied', job.url)}
                          disabled={!!loadingAction}
                          style={{ 
                            flex: 1, padding: "14px", background: "hsla(var(--primary), 0.1)", 
                            color: "hsl(var(--primary))", border: "1px solid hsla(var(--primary), 0.3)", borderRadius: 12, 
                            fontWeight: 800, fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                          }}
                        >
                          <Icons.External /> OPEN
                        </button>
                        <button 
                          onClick={() => handleAction(job.id, 'skipped')}
                          disabled={!!loadingAction}
                          style={{ 
                          padding: "14px 20px", background: "hsla(var(--foreground), 0.05)", 
                          color: "hsl(var(--foreground))", border: "1px solid hsla(var(--border), 0.5)",
                          borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer"
                        }}>
                          SKIP
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
