"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ExecutiveFunnel from "@/components/ExecutiveFunnel";
import SentinelFeed from "@/components/SentinelFeed";
import MatchRadar from "@/components/MatchRadar";
import { DailyHero, StrategyInsight, PulseWave, MomentumChart } from "@/components/StrategicDesign";
import { Scan, Activity, Layout, Target, BrainCircuit, ShieldCheck } from "lucide-react";

interface Stats {
  discovered: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "success" | "warning";
  msg: string;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ discovered: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [momentumData] = useState([20, 35, 25, 45, 60, 55, 85]);
  const [blockId, setBlockId] = useState<string | null>(null);

  useEffect(() => {
    setBlockId(new Date().getTime().toString(16).toUpperCase());
    
    const loadData = async () => {
      try {
        const [pipeRes, matchRes, logRes] = await Promise.all([
          fetch("/api/pipeline"),
          fetch("/api/match"),
          fetch("/api/logs")
        ]);
        const pipeData = await pipeRes.json();
        const matchData = await matchRes.json();
        const logData = await logRes.json();

        setStats({
          discovered: pipeData.discovered || 0,
          applied: pipeData.counts?.applied || 0,
          interview: pipeData.counts?.interview || 0,
          rejected: pipeData.counts?.rejected || 0,
          offer: pipeData.counts?.offer || 0
        });

        // Use matchData for radar (score-sorted) - Prioritize new, but show any high-fit
        const candidates = matchData.matches || [];
        const elite = candidates
          .filter((m: any) => m.status === 'new' || m.totalScore >= 85)
          .slice(0, 3);
        setTopMatches(elite);

        // Use real logs from Sentinel pulse
        setLogs(logData.length > 0 ? logData : [
          { id: "0", time: "System", type: "info", msg: "Sentinel Pulse: Standby. Analyzing market signals..." }
        ]);

      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    // Auto-refresh every 30 seconds for live pulse
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-10 py-16 space-y-16 pb-40 animate-fade-in relative noise-texture">
      
      {/* System Scan Visual Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-10">
        <div className="absolute top-[-100%] left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-[shimmer_8s_infinite_linear]" />
      </div>

      {/* Senior Narrative Header */}
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <DailyHero userName="Noam" summary="2 New High-Density Roles Found Today" />
        <div className="flex flex-col items-end gap-3 mb-2">
           <PulseWave />
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
             <ShieldCheck size={10} className="text-emerald-400" />
             <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Signal Integrity: 100%</p>
           </div>
        </div>
      </header>

      {/* The AI Strategy Engine */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StrategyInsight 
          title="Skill Gap Alert" 
          description="80% of your targets require 'FinOps'. OPI recommends a 1-hour focus session or CV recalibration."
          level="warning"
        />
        <StrategyInsight 
          title="Market Heatmap" 
          description="Cyber security hiring in Tel Aviv is up 14%. Your profile matches 3 new 'Product Analyst' slots."
          level="success"
        />
        <StrategyInsight 
          title="Swarm Advice" 
          description="You have 3 active interviews. OPI can generate interview prep guides for each company."
          level="info"
        />
      </section>

      {/* Main Grid Layout - Balanced for Senior Breathability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Intelligence Column (8/12) */}
        <div className="lg:col-span-8 space-y-20">
           <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Executive Pipeline</h3>
                <span className="h-px flex-1 bg-white/5 ml-4" />
             </div>
             <ExecutiveFunnel stats={stats} />
           </section>

           <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">High-Density Matches</h3>
                <span className="h-px flex-1 bg-white/5 ml-4" />
             </div>
             <MatchRadar matches={topMatches} />
           </section>

           {/* Tactical Operations */}
           <section className="glass-card p-12 rounded-[2.5rem] relative overflow-hidden group noise-texture">
             <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-30" />
             
             <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                   <h3 className="text-2xl font-black text-white px-1 tracking-tighter flex items-center gap-3">
                     <BrainCircuit size={24} className="text-primary" />
                     Tactical Operations
                   </h3>
                   <p className="text-[10px] font-black text-primary/40 uppercase mt-1 tracking-widest px-1">Global Sourcing Pulse & Overrides</p>
                </div>
                <Link href="/match" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
                  <span className="text-[10px] font-black text-primary tracking-widest">INITIATE FULL SWEEP</span>
                  <Activity size={12} className="text-primary animate-pulse" />
                </Link>
             </div>

             <div className="grid grid-cols-3 gap-8 relative z-10">
               <Link href="/discover" className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all group/btn">
                 <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover/btn:scale-110 group-hover/btn:bg-primary/10 transition-all duration-500">
                    <Scan size={32} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/btn:text-white transition-colors">Ingest Gmail</span>
               </Link>
               <Link href="/pipeline" className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all group/btn">
                 <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover/btn:scale-110 group-hover/btn:bg-primary/10 transition-all duration-500">
                    <Layout size={32} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/btn:text-white transition-colors">Pipeline Rail</span>
               </Link>
               <Link href="/match" className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all group/btn">
                 <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover/btn:scale-110 group-hover/btn:bg-primary/10 transition-all duration-500">
                    <Activity size={32} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/btn:text-white transition-colors">Tactical Score</span>
               </Link>
             </div>
           </section>
        </div>

        {/* Right Sidebar Audit Column (4/12) */}
        <div className="lg:col-span-4 sticky top-16 space-y-12">
           <SentinelFeed logs={logs} />
           
           {/* Data Visualization Sidebar Cards */}
           <div className="space-y-6">
              <div className="glass-card p-8 rounded-3xl border-primary/10 group hover:border-primary/30 transition-colors noise-texture">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Engagement Metrics</h4>
                  <Target size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <MomentumChart data={momentumData} />
                <div className="mt-6 pt-6 border-t border-white/5">
                   <div className="text-4xl font-black text-white/90 mb-1 tracking-tighter">94%</div>
                   <p className="text-[10px] font-bold text-emerald-400/60 uppercase italic tracking-widest">Velocity Amplitude: High</p>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl border-white/5  noise-texture">
                 <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-4">Swarm Integrity</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-white/30 uppercase">Uptime</span>
                       <span className="text-[10px] font-black text-emerald-400">99.9%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[99%] h-full bg-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
      
      {/* Precision Footer */}
      <footer className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-30">
         <div className="text-[10px] font-black tracking-[0.5em] text-white/60">OPI INTELLIGENCE SWARM // ENTERPRISE_OS_V9.0</div>
         <div className="flex gap-8 items-center">
           <div className="text-[9px] font-mono text-primary/60">CORE_SYNC: ACTIVE</div>
           <div className="text-[10px] font-mono uppercase text-white/40">BLOCK_ID: {blockId || "INITIALIZING..."}</div>
         </div>
      </footer>
    </div>
  );
}
