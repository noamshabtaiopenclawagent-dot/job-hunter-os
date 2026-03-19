"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

export function AgentMemoryEditor({ agentName }: { agentName: string }) {
  const [teamMemory, setTeamMemory] = useState("");
  const [currentFocus, setCurrentFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/agent-memory/${encodeURIComponent(agentName)}`)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        setTeamMemory(data.teamMemory || "");
        setCurrentFocus(data.currentFocus || "");
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [agentName]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/agent-memory/${encodeURIComponent(agentName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamMemory, currentFocus })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Failed to save memory.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 pb-2">
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-md transition-colors text-xs font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Save size={12} />}
          {saving ? "SAVING..." : saved ? "SAVED" : "SAVE STATE"}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          CURRENT_FOCUS.md (Agent Local)
        </label>
        <textarea
          value={currentFocus}
          onChange={e => setCurrentFocus(e.target.value)}
          className="flex-1 w-full bg-[#020617] text-emerald-400 font-mono text-xs p-3 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500/50 resize-none"
          spellCheck={false}
        />
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          TEAM_MEMORY.md (Global)
        </label>
        <textarea
          value={teamMemory}
          onChange={e => setTeamMemory(e.target.value)}
          className="flex-1 w-full bg-[#020617] text-blue-300 font-mono text-xs p-3 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500/50 resize-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
