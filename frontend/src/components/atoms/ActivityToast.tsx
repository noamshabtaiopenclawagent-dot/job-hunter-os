"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/auth/clerk";
import { getApiBaseUrl } from "@/lib/api-base";

// Only show toasts for these event types
const TOAST_EVENTS = new Set(["task.status_changed", "agent.turn.end", "task.created"]);

const EVENT_STYLE: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  "task.status_changed": { icon: "⚡", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  "task.created":        { icon: "📌", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  "agent.turn.end":      { icon: "✅", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

type Toast = {
  id: string;
  icon: string;
  message: string;
  color: string;
  bg: string;
  border: string;
  exiting: boolean;
};

const TOAST_LIFETIME_MS = 4500;
const MAX_TOASTS = 4;

export function ActivityToast() {
  const { isSignedIn, getToken } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef(new Set<string>());
  const abortRef = useRef<AbortController | null>(null);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (t: Omit<Toast, "exiting">) => {
      if (seenIds.current.has(t.id)) return;
      seenIds.current.add(t.id);
      setToasts((prev) => {
        const next = [{ ...t, exiting: false }, ...prev].slice(0, MAX_TOASTS);
        return next;
      });
      setTimeout(() => dismiss(t.id), TOAST_LIFETIME_MS);
    },
    [dismiss]
  );

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;
    abortRef.current = new AbortController();

    (async () => {
      try {
        // Use polling via /api/v1/activity as SSE stream may not be exposed to browser
        const poll = async () => {
          if (cancelled) return;
          try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(
              `${getApiBaseUrl()}/api/v1/activity?limit=5`,
              {
                cache: "no-store",
                headers: { Authorization: `Bearer ${token}` },
                signal: abortRef.current?.signal,
              }
            );
            if (!res.ok) return;
            const data = await res.json();
            const items: { id: string; event_type: string; message?: string; created_at?: string }[] =
              data.items ?? [];
            for (const item of items) {
              if (!TOAST_EVENTS.has(item.event_type)) continue;
              const style = EVENT_STYLE[item.event_type] ?? {
                icon: "•", color: "text-slate-700", bg: "bg-white", border: "border-slate-200",
              };
              addToast({
                id: item.id,
                icon: style.icon,
                message: item.message?.slice(0, 80) ?? item.event_type,
                color: style.color,
                bg: style.bg,
                border: style.border,
              });
            }
          } catch { /* ignore network errors */ }
        };

        await poll();
        const interval = setInterval(poll, 15_000);
        abortRef.current!.signal.addEventListener("abort", () => clearInterval(interval));
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [isSignedIn, getToken, addToast]);

  if (!isSignedIn || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
      style={{ maxWidth: 340 }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 rounded-xl border shadow-lg px-3 py-2.5 text-xs transition-all duration-300 ${toast.bg} ${toast.border} ${
            toast.exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
          }`}
        >
          <span className="text-base shrink-0 mt-0.5">{toast.icon}</span>
          <p className={`flex-1 leading-snug font-medium ${toast.color}`}>{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
