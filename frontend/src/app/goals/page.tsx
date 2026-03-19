"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/auth/clerk";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { Target, Save, CheckCircle2, Loader2, Edit3, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function GoalsPage() {
  const { isSignedIn } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/goals")
      .then(res => res.json())
      .then(data => {
        setContent(data.content || "");
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [isSignedIn]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      alert("Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <DashboardShell>
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Sign in to view Company Goals.</p>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Strategic OKRs</h1>
              <p className="text-xs text-slate-500">Company-wide goals and key results tracker.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isEditing ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Edit3 size={14} /> EDIT
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isEditing ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Eye size={14} /> PREVIEW
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Save size={16} />}
              {saving ? "Saving..." : saved ? "Saved" : "Save OKRs"}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <div className={`w-full h-full max-w-4xl mx-auto rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white transition-all`}>
              {isEditing ? (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Define your company OKRs..."
                  className="w-full h-full p-6 text-sm font-mono text-slate-800 focus:outline-none resize-none"
                  spellCheck={false}
                />
              ) : (
                <div className="w-full h-full p-8 overflow-y-auto prose prose-slate prose-h1:text-2xl prose-h2:text-xl prose-p:text-slate-600 max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
