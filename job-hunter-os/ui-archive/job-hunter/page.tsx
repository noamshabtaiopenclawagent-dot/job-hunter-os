"use client";

import { useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type Stage = "discovered" | "shortlisted" | "applied" | "interview" | "rejected" | "offer";

type JobCard = {
  id: string;
  title: string;
  company: string;
  location: string;
  stage: Stage;
  fitScore: number;
  reasons: string[];
  source: string;
  dateAdded: string;
};

const STAGES: Stage[] = ["discovered", "shortlisted", "applied", "interview", "rejected", "offer"];

const STAGE_LABEL: Record<Stage, string> = {
  discovered: "Discovered",
  shortlisted: "Shortlisted",
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

const STAGE_COLOR: Record<Stage, string> = {
  discovered: "bg-slate-800 text-slate-300",
  shortlisted: "bg-blue-900/50 text-blue-300 border-blue-800",
  applied: "bg-amber-900/50 text-amber-300 border-amber-800",
  interview: "bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800",
  rejected: "bg-red-900/50 text-red-300 border-red-800",
  offer: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
};

const STORAGE_KEY = "jobhunter.v1.pipeline";

const seedJobs: JobCard[] = [
  {
    id: "jh-1",
    title: "Product Analyst",
    company: "Monday.com",
    location: "Tel Aviv, IL",
    source: "LinkedIn",
    stage: "shortlisted",
    fitScore: 88,
    reasons: ["Strong product analytics stack", "Hi-tech fit", "3-5y range"],
    dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "jh-2",
    title: "Business Analyst",
    company: "Wix",
    location: "Tel Aviv, IL",
    source: "Company Site",
    stage: "discovered",
    fitScore: 82,
    reasons: ["Domain fit", "Role alignment", "Good growth potential"],
    dateAdded: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "jh-3",
    title: "Data Analyst",
    company: "Rapyd",
    location: "Tel Aviv, IL",
    source: "LinkedIn",
    stage: "applied",
    fitScore: 85,
    reasons: ["SQL heavy", "Product + business analytics", "Tech domain"],
    dateAdded: new Date().toISOString(),
  },
  {
    id: "jh-4",
    title: "Senior BI Analyst",
    company: "Riskified",
    location: "Tel Aviv, IL (Hybrid)",
    source: "Referral",
    stage: "interview",
    fitScore: 94,
    reasons: ["Fraud domain is interesting", "High salary bracket", "Tech stack match"],
    dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "jh-5",
    title: "Data Scientist I",
    company: "AppsFlyer",
    location: "Herzliya, IL",
    source: "Indeed",
    stage: "rejected",
    fitScore: 71,
    reasons: ["Requires Ph.D.", "More ML focus than analytics"],
    dateAdded: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

function nextStage(stage: Stage): Stage {
  const i = STAGES.indexOf(stage);
  if (i < 0 || i === STAGES.length - 1) return stage;
  return STAGES[i + 1];
}

function prevStage(stage: Stage): Stage {
  const i = STAGES.indexOf(stage);
  if (i <= 0) return stage;
  return STAGES[i - 1];
}

export default function JobHunterPage() {
  const [jobs, setJobs] = useState<JobCard[]>(() => {
    if (typeof window === "undefined") return seedJobs;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return seedJobs;
      const parsed = JSON.parse(raw) as JobCard[];
      return Array.isArray(parsed) && parsed.length ? parsed : seedJobs;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return seedJobs;
    }
  });
  
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Stage>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const filtered = useMemo(() => {
    let result = jobs;
    
    if (activeTab !== "all") {
      result = result.filter(j => j.stage === activeTab);
    }
    
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((j) =>
        [j.title, j.company, j.location, j.source, ...j.reasons].join(" ").toLowerCase().includes(q),
      );
    }
    
    // Sort by Fit Score descending
    return result.sort((a, b) => b.fitScore - a.fitScore);
  }, [jobs, query, activeTab]);

  const move = (id: string, dir: "next" | "prev") => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        return { ...j, stage: dir === "next" ? nextStage(j.stage) : prevStage(j.stage) };
      }),
    );
  };
  
  const archiveJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, stage: "rejected" } : j));
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200">
      {/* SaaS Dashboard Header */}
      <header className="sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/60 bg-[#0B0F19]/95 px-6 py-5 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">Job Hunter Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">High-density pipeline management.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, roles, locations..."
              className="w-full rounded-md bg-slate-900/50 border border-slate-800 py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
          </div>
          <button className="shrink-0 flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition-colors shadow-sm shadow-emerald-900/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Lead
          </button>
        </div>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Stage Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"}`}
          >
            All Jobs <span className="ml-1.5 text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-md">{jobs.length}</span>
          </button>
          
          <div className="w-px h-4 bg-slate-800 mx-2" />
          
          {STAGES.map(stage => {
            const count = jobs.filter(j => j.stage === stage).length;
            const isActive = activeTab === stage;
            return (
              <button 
                key={stage}
                onClick={() => setActiveTab(stage)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"}`}
              >
                {STAGE_LABEL[stage]} <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${isActive ? "bg-slate-700" : "bg-slate-800/50"}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* DataGrid Ledger */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-medium">Fit</th>
                  <th className="px-5 py-4 font-medium">Role & Company</th>
                  <th className="px-5 py-4 font-medium">Stage</th>
                  <th className="px-5 py-4 font-medium hidden lg:table-cell">Location</th>
                  <th className="px-5 py-4 font-medium hidden md:table-cell">Insight / Why</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(job => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg font-semibold text-sm ${
                          job.fitScore >= 90 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          job.fitScore >= 80 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {job.fitScore}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{job.title}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {job.company}
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          {job.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STAGE_COLOR[job.stage] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                        {STAGE_LABEL[job.stage]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs hidden lg:table-cell">
                      {job.location}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell max-w-[300px] truncate text-xs text-slate-400">
                      {job.reasons.length > 0 ? job.reasons.join(" • ") : <span className="text-slate-600 italic">No notes</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.stage !== "rejected" && job.stage !== "offer" && (
                          <button 
                            onClick={() => move(job.id, "next")}
                            className="bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5"
                          >
                            Advance
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        )}
                        {job.stage !== "rejected" && (
                          <button 
                            onClick={() => archiveJob(job.id)}
                            className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                            title="Reject/Archive"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-3">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <h3 className="text-sm font-medium text-slate-300">No jobs found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add new leads.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
