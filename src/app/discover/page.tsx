"use client";

import { useEffect, useState } from "react";

// Professional SVG Icons
const Icons = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  ),
  Globe: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  ),
  External: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6 v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  )
};

const getScoreColor = (s: number) =>
  s >= 85 ? "hsl(var(--success))" : s >= 70 ? "hsl(var(--warning))" : "hsla(var(--foreground), 0.4)";

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?query=${query}&remote=${remoteOnly}`);
      const data = await res.json();
      setJobs(data.jobs.filter((j: any) => j.status !== 'skipped' && j.status !== 'applied'));
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [query, remoteOnly]);

  const handleAction = async (id: string, status: 'applied' | 'skipped', url?: string) => {
    if (status === 'applied') setApplyLoading(id);
    else setSkipLoading(id);

    try {
      await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (url && status === 'applied') window.open(url, '_blank');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (e) {
      console.error("Action failed", e);
    } finally {
      setApplyLoading(null);
      setSkipLoading(null);
    }
  };

  const handleQuickApply = async (id: string, url: string) => {
    setApplyLoading(id);
    try {
      // 1. Trigger PDF Download
      const link = document.createElement('a');
      link.href = '/api/cv/pdf';
      link.download = 'Noam_Shabtai_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Open Job URL & Update Status
      await handleAction(id, 'applied', url);
    } catch (e) {
      console.error("Quick Apply failed", e);
    }
  };

  const handleGmailScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/jobs/gmail", { method: "POST" });
      const data = await res.json();
      setScanResult(`Found ${data.newJobs} new opportunities in your Gmail.`);
      setTimeout(() => setScanResult(null), 5000);
      fetchJobs();
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 40, animation: "fade-in-up 0.6s ease-out" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 900, color: "hsl(var(--foreground))", letterSpacing: "-1.5px", marginBottom: 12 }}>
          <Icons.Globe /> Discover <span style={{ color: "hsl(var(--primary))" }}>Market</span>
        </h1>
        <p style={{ fontSize: 16, color: "hsla(var(--foreground), 0.6)" }}>Live insights from the Israeli ecosystem. Synthesizing {jobs.length} open positions.</p>
      </header>

      {/* Glass Filter Bar */}
      <div 
        className="glass-card"
        style={{ 
          display: "flex", gap: 12, padding: "12px 16px", marginBottom: 32, 
          borderRadius: 16, position: "sticky", top: 80, zIndex: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 8, color: "hsla(var(--foreground), 0.4)" }}><Icons.Search /></div>
        <input
          placeholder="Search roles, tech, or companies..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", color: "white", outline: "none", padding: "0 8px", fontSize: 14 }}
        />
        
        <button 
          onClick={() => setRemoteOnly(!remoteOnly)}
          style={{ 
            background: remoteOnly ? "hsla(var(--primary), 0.2)" : "transparent",
            color: remoteOnly ? "hsl(var(--primary))" : "hsla(var(--foreground), 0.6)",
            border: `1px solid ${remoteOnly ? "hsl(var(--primary))" : "hsla(var(--border), 0.5)"}`,
            padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Remote Only
        </button>

        <button 
          onClick={handleGmailScan}
          disabled={scanning}
          style={{ 
            background: scanning ? "hsla(var(--primary), 0.2)" : "transparent",
            color: "hsla(var(--foreground), 0.8)", 
            border: `1px solid hsla(var(--border), 0.5)`,
            padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, 
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}
        >
          {scanning ? <div className="glow-pulse" style={{ width: 12, height: 12, borderRadius: "50%", background: "hsl(var(--primary))" }} /> : <Icons.Mail />}
          SCAN GMAIL
        </button>

        <button 
          onClick={() => { setRefreshing(true); fetchJobs(); }}
          style={{ 
            background: "hsl(var(--primary))", color: "white", border: "none", 
            padding: "8px 20px", borderRadius: 10, fontWeight: 800, fontSize: 13, 
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}
        >
          {refreshing ? <div className="glow-pulse" style={{ width: 12, height: 12, borderRadius: "50%", background: "white" }} /> : <Icons.Refresh />}
          REFRESH
        </button>
      </div>

      {scanResult && (
        <div style={{ 
          background: "hsla(var(--primary), 0.1)", border: "1px solid hsla(var(--primary), 0.2)", 
          padding: "12px 20px", borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 700,
          color: "hsl(var(--primary))", textAlign: "center", animation: "fade-in 0.3s ease-out"
        }}>
          {scanResult}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "hsla(var(--foreground), 0.4)" }}>
          <div className="glow-pulse" style={{ width: 40, height: 40, borderRadius: "50%", background: "hsl(var(--primary))", margin: "0 auto 20px" }} />
          <p>Scanning ecosystem...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {jobs.map((job, i) => (
            <div 
              key={job.id} 
              className="glass-card animate-in"
              style={{ padding: "24px 32px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>{job.title}</h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    {job.isNew && <span style={{ fontSize: 9, fontWeight: 900, color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.1)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>New</span>}
                    {job.is_remote === 1 && <span style={{ fontSize: 9, fontWeight: 900, color: "hsl(var(--success))", background: "hsla(var(--success), 0.1)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Remote</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, color: "hsla(var(--foreground), 0.5)", fontSize: 13 }}>
                  <span>{job.city || job.location}</span>
                  <span>•</span>
                  <span>{job.source}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ 
                    width: 56, height: 56, borderRadius: "50%", 
                    border: `2px solid ${getScoreColor(job.score)}`, 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", backdropFilter: "blur(4px)",
                    boxShadow: `0 0 15px ${getScoreColor(job.score)}22`
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: getScoreColor(job.score) }}>{job.score}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    onClick={() => handleQuickApply(job.id, job.url)}
                    disabled={!!applyLoading}
                    className="glow-pulse"
                    style={{ 
                      display: "flex", alignItems: "center", gap: 8,
                      background: "hsl(var(--success))", color: "white", border: "none", 
                      padding: "10px 20px", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" 
                    }}
                  >
                    <Icons.Zap /> {applyLoading === job.id ? "..." : "QUICK APPLY"}
                  </button>
                  <button 
                    onClick={() => handleAction(job.id, 'applied', job.url)}
                    disabled={!!applyLoading}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 8,
                      background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", border: `1px solid hsla(var(--primary), 0.3)`, 
                      padding: "10px 16px", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" 
                    }}
                  >
                    <Icons.External /> {applyLoading === job.id ? "..." : "OPEN"}
                  </button>
                  <button 
                    onClick={() => handleAction(job.id, 'skipped')}
                    disabled={!!skipLoading}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 8,
                      background: "hsla(var(--foreground), 0.05)", color: "hsla(var(--foreground), 0.6)", 
                      border: "1px solid hsla(var(--border), 0.5)",
                      padding: "10px 12px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" 
                    }}
                  >
                    <Icons.Trash /> {skipLoading === job.id ? "..." : "SKIP"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
