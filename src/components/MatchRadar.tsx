"use client";
import React from "react";
import { ProgressRing, StatusBadge } from "./EnterpriseUI";
import { Star, MapPin, Briefcase, Zap } from "lucide-react";

interface Match {
  id: string;
  title: string;
  company: string;
  totalScore: number;
  status: string;
  url?: string;
  missingSkills?: string[];
  factors: any[];
}

export default function MatchRadar({ matches }: { matches: Match[] }) {
  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black tracking-tight text-white/90 flex items-center gap-2">
           <Zap size={18} className="text-primary fill-primary/20" />
           Elite Opportunities
        </h2>
        <span className="text-[10px] font-black px-2 py-1 rounded bg-white/5 text-white/40 border border-white/10 uppercase tracking-widest">
          {matches.length} Targets
        </span>
      </div>

      <div className="grid gap-4">
        {matches.map((m) => (
          <div key={m.id} className="glass-card p-6 rounded-2xl group relative overflow-hidden flex items-center justify-between gap-6 transition-all hover:border-primary/40 noise-texture">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                 <StatusBadge status={m.status || 'new'} />
                 <a 
                   href={m.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="font-black text-lg text-white/90 hover:text-primary transition-all flex items-center gap-2 group/link"
                 >
                    {m.title}
                    <Zap size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity text-primary" />
                 </a>
              </div>
              
              <div className="flex items-center gap-4 text-[11px] font-bold text-white/30 mb-4">
                 <div className="flex items-center gap-1"><Briefcase size={12}/> {m.company}</div>
                 <div className="flex items-center gap-1"><MapPin size={12}/> Tel Aviv-Yafo</div>
                 <div className="flex items-center gap-1 text-primary/60"><Star size={12} className="fill-primary/20"/> Strategic Fit</div>
              </div>

              {m.missingSkills && m.missingSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  {m.missingSkills.map(s => (
                    <span key={s} className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing score={m.totalScore} size={64} />
              <div className="text-[9px] font-black opacity-20 mt-2 uppercase tracking-widest text-center">
                Match<br/>Confidence
              </div>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 font-bold uppercase text-xs tracking-widest">
             No active elite targets found
          </div>
        )}
      </div>
    </div>
  );
}
