import { CalendarClock, Check, UserCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

type TaskStatus = "inbox" | "in_progress" | "review" | "done";

interface TaskCardProps {
  title: string;
  status?: TaskStatus;
  priority?: string;
  assignee?: string;
  due?: string;
  isOverdue?: boolean;
  approvalsPendingCount?: number;
  tags?: Array<{ id: string; name: string; color: string }>;
  isBlocked?: boolean;
  blockedByCount?: number;
  isStuck?: boolean;
  description?: string | null;
  onClick?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({
  title,
  status,
  priority,
  assignee,
  due,
  isOverdue = false,
  approvalsPendingCount = 0,
  tags = [],
  isBlocked = false,
  blockedByCount = 0,
  isStuck = false,
  description,
  onClick,
  onApprove,
  onReject,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const hasPendingApproval = approvalsPendingCount > 0;
  const needsLeadReview =
    status === "review" && !isBlocked && !hasPendingApproval;
  const leftBarClassName = isBlocked
    ? "bg-rose-400"
    : hasPendingApproval
      ? "bg-amber-400"
      : needsLeadReview
        ? "bg-indigo-400"
        : null;
  const priorityBadge = (value?: string) => {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized === "high") {
      return "bg-rose-100 text-rose-700";
    }
    if (normalized === "medium") {
      return "bg-amber-100 text-amber-700";
    }
    if (normalized === "low") {
      return "bg-emerald-100 text-emerald-700";
    }
    return "bg-slate-100 text-slate-600";
  };

  const priorityLabel = priority ? priority.toUpperCase() : "MEDIUM";
  const visibleTags = tags.slice(0, 3);

  // Extract Artifact URL from description if present
  const artifactMatch = description?.match(/Artifact:\s*([^\s]+)/i) || description?.match(/\[Artifact\]\(([^)]+)\)/i);
  const artifactUrl = artifactMatch ? artifactMatch[1].replace(/\]$/, '') : null;

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        isDragging && "opacity-60 shadow-none",
        hasPendingApproval && "border-amber-200 bg-amber-50/40",
        isBlocked && "border-rose-200 bg-rose-50/50",
        needsLeadReview && "border-indigo-200 bg-indigo-50/30",
        isStuck && "ring-2 ring-red-400"
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      {leftBarClassName ? (
        <span
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-l-lg",
            leftBarClassName,
          )}
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-slate-900 line-clamp-2 break-words">
            {title}
          </p>
          {isStuck ? (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              Stagnant (24h+)
            </div>
          ) : null}
          {isBlocked ? (
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Blocked{blockedByCount > 0 ? ` · ${blockedByCount}` : ""}
            </div>
          ) : null}
          {hasPendingApproval ? (
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Approval needed · {approvalsPendingCount}
            </div>
          ) : null}
          {needsLeadReview ? (
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Waiting for lead review
            </div>
          ) : null}
          {visibleTags.length ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `#${tag.color}` }}
                  />
                  {tag.name}
                </span>
              ))}
              {tags.length > visibleTags.length ? (
                <span className="text-[10px] font-semibold text-slate-500">
                  +{tags.length - visibleTags.length}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
              priorityBadge(priority) ?? "bg-slate-100 text-slate-600",
            )}
          >
            {priorityLabel}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-slate-400" />
          <span>{assignee ?? "Unassigned"}</span>
        </div>
        {due ? (
          <div
            className={cn(
              "flex items-center gap-2",
              isOverdue && "font-semibold text-rose-600",
            )}
          >
            <CalendarClock
              className={cn(
                "h-4 w-4",
                isOverdue ? "text-rose-500" : "text-slate-400",
              )}
            />
            <span>{due}</span>
          </div>
        ) : null}
      </div>
      
      {artifactUrl ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <a
            href={typeof window !== "undefined" && artifactUrl.startsWith("/") ? `file://${artifactUrl}` : artifactUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-50 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            View Generated Artifact
          </a>
        </div>
      ) : null}

      {/* Inline Approval Actions — visible only on cards in Review with pending approvals */}
      {hasPendingApproval && status === "review" && (onApprove || onReject) ? (
        <div className="mt-3 flex items-center gap-2 border-t border-amber-100 pt-3">
          {onApprove ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700 active:scale-95"
            >
              <Check className="h-3 w-3" /> Approve
            </button>
          ) : null}
          {onReject ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReject(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
            >
              <X className="h-3 w-3" /> Reject
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
