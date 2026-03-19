"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCcw, Download, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogViewer({ agentName, agentId }: { agentName: string; agentId: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [fileMarker, setFileMarker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/logs/${encodeURIComponent(agentName)}`);
      if (res.ok) {
        const data = await res.json();
        setLines(data.lines || []);
        setFileMarker(data.file || null);
      } else {
        setLines(["Failed to load logs. Server returned " + res.status]);
      }
    } catch (e) {
      setLines(["Network error while fetching logs."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [agentName]);

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const downloadLogs = () => {
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase()}-logs-${new Date().toISOString()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 shadow-inner overflow-hidden font-mono text-xs">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={14} />
          <span>{fileMarker ? `Tailing ${fileMarker}` : "Live Logs"}</span>
          {loading && <RefreshCcw size={12} className="animate-spin ml-2 text-slate-500" />}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn("px-2 py-1 rounded transition-colors", autoScroll ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500 hover:text-slate-300")}
          >
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
          <button onClick={downloadLogs} className="text-slate-400 hover:text-white transition" title="Export logs">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Log console */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {lines.length === 0 && !loading && (
          <div className="flex items-center gap-2 text-slate-500 italic">
            <Info size={14} /> No output available.
          </div>
        )}
        
        {lines.map((line, i) => {
          // crude colorization
          let color = "text-slate-300";
          if (line.toLowerCase().includes("error") || line.toLowerCase().includes("fail")) color = "text-rose-400";
          else if (line.toLowerCase().includes("warn")) color = "text-amber-400";
          else if (line.toLowerCase().includes("success") || line.toLowerCase().includes("done")) color = "text-emerald-400";
          else if (line.startsWith("[")) color = "text-blue-300"; // brackets often timestamps/tags

          return (
            <div key={i} className={cn("break-all", color)}>
              {line}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

    </div>
  );
}
