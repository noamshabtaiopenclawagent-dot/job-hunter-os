"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/auth/clerk";
import { useListBoardsApiV1BoardsGet, type listBoardsApiV1BoardsGetResponse } from "@/api/generated/boards/boards";
import { useListAgentsApiV1AgentsGet, type listAgentsApiV1AgentsGetResponse } from "@/api/generated/agents/agents";
import { useCreateTaskApiV1BoardsBoardIdTasksPost } from "@/api/generated/tasks/tasks";
import { ApiError } from "@/api/mutator";
import { Bot, Folder, Plus, Loader2 } from "lucide-react";

export function QuickTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isSignedIn } = useAuth();
  
  const [title, setTitle] = useState("");
  const [boardId, setBoardId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const boardsQ = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    undefined, { query: { enabled: isOpen && !!isSignedIn } }
  );
  
  const agentsQ = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 50 }, { query: { enabled: isOpen && !!isSignedIn } }
  );

  const createMut = useCreateTaskApiV1BoardsBoardIdTasksPost();

  const boards = useMemo(() => boardsQ.data?.status === 200 ? (boardsQ.data.data.items ?? []) : [], [boardsQ.data]);
  const agents = useMemo(() => agentsQ.data?.status === 200 ? (agentsQ.data.data.items ?? []) : [], [agentsQ.data]);

  // Handle escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleRawKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleRawKey);
    return () => window.removeEventListener("keydown", handleRawKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Select first board as default if none selected
    if (isOpen && !boardId && boards.length > 0) {
      setBoardId(boards[0].id);
    }
  }, [isOpen, boards, boardId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !boardId) return;

    try {
      await createMut.mutateAsync({
        boardId,
        data: {
          title: title.trim(),
          description: "Created via Quick Task shortcut",
          priority: "medium",
          assignee_id: assigneeId || null,
        } as any
      });
      setTitle("");
      onClose();
    } catch (e) {
      console.error("Failed to create task", e);
      alert("Failed to create task");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Plus className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Quick Task</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Press ESC to cancel</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-base border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Folder size={12}/> Board
              </label>
              <select 
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select board...</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Bot size={12}/> Assignee
              </label>
              <select 
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMut.isPending || !title.trim() || !boardId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition flex items-center gap-2"
            >
              {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
