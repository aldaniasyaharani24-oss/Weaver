"use client";

import { useEffect, useState } from "react";
import type { WorkspaceOverview, WorkspaceWithStats } from "@/features/workspace/types/workspace";

interface AISummaryCardProps {
  workspace: WorkspaceWithStats;
  overview: WorkspaceOverview;
}

type Status = "idle" | "loading" | "streaming" | "done" | "error" | "unconfigured";

export function AISummaryCard({ workspace, overview }: AISummaryCardProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function fetchSummary() {
    setStatus("loading");
    setText("");

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_name: workspace.name,
          total_tasks: overview.total_tasks,
          done_tasks: overview.done_tasks,
          overdue_tasks: overview.overdue_tasks,
          in_progress_tasks: overview.in_progress_tasks,
          progress: overview.progress,
          board_count: workspace.board_count,
          member_count: workspace.member_count,
          upcoming_deadlines: overview.upcoming_deadlines,
          overdue_list: overview.overdue_list,
        }),
      });

      if (res.status === 503) { setStatus("unconfigured"); return; }
      if (!res.ok) { setStatus("error"); return; }

      setStatus("streaming");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { setStatus("error"); return; }

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setText(accumulated);
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.id]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Ringkasan AI</h3>
            <p className="text-xs text-gray-400">Powered by Groq · Llama 3.3</p>
          </div>
          {(status === "loading" || status === "streaming") && (
            <span className="flex gap-0.5 ml-1">
              <span className="size-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {(status === "done" || status === "error") && (
          <button
            onClick={fetchSummary}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Perbarui
          </button>
        )}
      </div>

      {/* Content */}
      {status === "idle" || status === "loading" ? (
        <div className="space-y-2.5">
          <div className="h-3.5 w-full bg-gray-100 animate-pulse rounded-full" />
          <div className="h-3.5 w-5/6 bg-gray-100 animate-pulse rounded-full" />
          <div className="h-3.5 w-4/6 bg-gray-100 animate-pulse rounded-full" />
        </div>
      ) : status === "unconfigured" ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <svg className="size-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">API key belum dikonfigurasi</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Tambahkan <code className="bg-amber-100 px-1 rounded font-mono">GROQ_API_KEY</code> ke <code className="bg-amber-100 px-1 rounded font-mono">.env.local</code> lalu restart server.
            </p>
          </div>
        </div>
      ) : status === "error" ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">Gagal memuat ringkasan.</p>
          <button onClick={fetchSummary} className="text-xs text-red-500 hover:text-red-700 font-medium">
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed">
          {text}
          {status === "streaming" && (
            <span className="inline-block size-2 ml-0.5 rounded-sm bg-indigo-400 animate-pulse align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
