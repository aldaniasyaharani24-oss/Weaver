"use client";

import { useState } from "react";
import type { OverviewTask } from "@/features/workspace/types/workspace";

interface TaskAnalysis {
  task_id: string;
  task_title: string;
  risk_level: "low" | "medium" | "high" | "critical";
  reason: string;
  recommendation: string;
}

interface AnalysisResult {
  analyses: TaskAnalysis[];
  overall_assessment: string;
}

interface AIPriorityWidgetProps {
  workspaceName: string;
  overdueTasks: OverviewTask[];
  upcomingTasks: OverviewTask[];
}

const RISK_CONFIG = {
  critical: { label: "Kritis", badge: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-500" },
  high: { label: "Tinggi", badge: "bg-orange-100 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
  medium: { label: "Sedang", badge: "bg-yellow-100 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
  low: { label: "Rendah", badge: "bg-green-100 text-green-700 border border-green-200", dot: "bg-green-500" },
} as const;

type Status = "idle" | "loading" | "done" | "error" | "unconfigured";

export function AIPriorityWidget({ workspaceName, overdueTasks, upcomingTasks }: AIPriorityWidgetProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const allTasks = [...overdueTasks, ...upcomingTasks].slice(0, 10);

  async function handleAnalyze() {
    if (allTasks.length === 0) return;
    setStatus("loading");
    setResult(null);

    try {
      const res = await fetch("/api/ai/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_name: workspaceName,
          tasks: allTasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            due_date: t.due_date,
          })),
        }),
      });

      if (res.status === 503) { setStatus("unconfigured"); return; }
      if (!res.ok) { setStatus("error"); return; }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shrink-0">
            <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">AI Priority Analysis</h3>
            <p className="text-xs text-gray-400">{allTasks.length} task akan dianalisis</p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={status === "loading" || allTasks.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? (
            <>
              <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Analisis Sekarang
            </>
          )}
        </button>
      </div>

      {/* Empty state */}
      {allTasks.length === 0 && status === "idle" && (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <svg className="size-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Semua task on track!</p>
          <p className="text-xs mt-0.5">Tidak ada task terlambat atau mendekati deadline</p>
        </div>
      )}

      {/* Unconfigured */}
      {status === "unconfigured" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <svg className="size-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-amber-700">
            Tambahkan <code className="bg-amber-100 px-1 rounded font-mono text-xs">GROQ_API_KEY</code> ke <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env.local</code> lalu restart server.
          </p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">Gagal menganalisis.</p>
          <button onClick={handleAnalyze} className="text-xs text-red-500 hover:text-red-700 font-medium">Coba lagi</button>
        </div>
      )}

      {/* Hasil */}
      {status === "done" && result && (
        <div className="space-y-3">
          {/* Overall */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 mb-1">Penilaian Keseluruhan</p>
            <p className="text-sm text-gray-700">{result.overall_assessment}</p>
          </div>

          {/* Per task */}
          <div className="space-y-2">
            {result.analyses.map((item) => {
              const risk = RISK_CONFIG[item.risk_level];
              return (
                <div key={item.task_id} className="rounded-xl border border-gray-200 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full shrink-0 ${risk.dot}`} />
                    <p className="text-sm font-medium text-gray-800 flex-1 truncate">{item.task_title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${risk.badge}`}>
                      {risk.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-4">{item.reason}</p>
                  <div className="flex items-start gap-1.5 pl-4">
                    <svg className="size-3.5 text-indigo-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-indigo-600 font-medium">{item.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
