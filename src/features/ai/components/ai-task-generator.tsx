"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTask } from "@/features/task/actions/task.actions";

interface GeneratedTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimated_hours: number;
}

interface AITaskGeneratorProps {
  workspaceId: string;
  workspaceName: string;
  defaultBoardId?: string;
}

const PRIORITY_CONFIG = {
  high: { label: "Tinggi", cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  medium: { label: "Sedang", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
  low: { label: "Rendah", cls: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
} as const;

type Status = "idle" | "loading" | "done" | "error" | "unconfigured";

export function AITaskGenerator({ workspaceId: _workspaceId, workspaceName, defaultBoardId }: AITaskGeneratorProps) {
  const [description, setDescription] = useState("");
  const [taskCount, setTaskCount] = useState(5);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [importing, setImporting] = useState(false);

  async function handleGenerate() {
    if (!description.trim()) { toast.error("Masukkan deskripsi proyek"); return; }
    setStatus("loading");
    setTasks([]);
    setSelected(new Set());
    try {
      const res = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, workspace_name: workspaceName, count: taskCount }),
      });
      if (res.status === 503) { setStatus("unconfigured"); return; }
      if (!res.ok) { setStatus("error"); return; }
      const data = await res.json();
      const taskList: GeneratedTask[] = data.tasks ?? [];
      setTasks(taskList);
      setSelected(new Set(taskList.map((_: GeneratedTask, i: number) => i)));
      setStatus("done");
    } catch { setStatus("error"); }
  }

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  async function handleImport() {
    if (!defaultBoardId) { toast.error("Tidak ada board di workspace ini. Buat board dulu."); return; }
    if (selected.size === 0) { toast.error("Pilih minimal 1 task"); return; }
    setImporting(true);
    const toImport = tasks.filter((_, i) => selected.has(i));
    let ok = 0;
    for (const t of toImport) {
      const r = await createTask({ board_id: defaultBoardId, title: t.title, description: t.description, priority: t.priority, status: "todo" });
      if (r?.success) ok++;
    }
    setImporting(false);
    toast.success(`${ok} task berhasil diimpor!`);
    setTasks([]); setSelected(new Set()); setStatus("idle"); setDescription("");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">AI Task Generator</h3>
          <p className="text-xs text-gray-400">Deskripsikan proyek → AI buatkan daftar task</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <textarea
          className="w-full min-h-[96px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
          placeholder="Contoh: Membuat website e-commerce dengan fitur keranjang belanja, checkout, dan manajemen produk untuk UMKM..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Jumlah task:</span>
            <div className="flex gap-1">
              {[3, 5, 7, 10].map((n) => (
                <button key={n} type="button" onClick={() => setTaskCount(n)}
                  className={`size-8 rounded-lg text-sm font-semibold transition-colors ${taskCount === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleGenerate}
            disabled={status === "loading" || !description.trim()}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {status === "loading" ? (
              <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
            ) : (
              <><svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>Generate Task</>
            )}
          </button>
        </div>

        {status === "unconfigured" && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <svg className="size-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <p className="text-sm text-amber-700">Tambahkan <code className="bg-amber-100 px-1 rounded font-mono text-xs">GROQ_API_KEY</code> ke <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env.local</code> lalu restart server.</p>
          </div>
        )}
        {status === "error" && <p className="text-sm text-red-500">Gagal generate task. Coba lagi.</p>}
      </div>

      {/* Hasil generate */}
      {status === "done" && tasks.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">{tasks.length} task dihasilkan</p>
            <div className="flex items-center gap-3 text-xs">
              <button onClick={() => setSelected(new Set(tasks.map((_, i) => i)))} className="text-indigo-600 hover:underline">Pilih semua</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600">Batal pilih</button>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((task, idx) => {
              const p = PRIORITY_CONFIG[task.priority];
              return (
                <button key={idx} type="button" onClick={() => toggleSelect(idx)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all ${selected.has(idx) ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`size-4 rounded mt-0.5 border-2 shrink-0 flex items-center justify-center ${selected.has(idx) ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                      {selected.has(idx) && <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.cls}`}>
                          <span className={`size-1.5 rounded-full ${p.dot}`} />{p.label}
                        </span>
                        <span className="text-xs text-gray-400">~{task.estimated_hours} jam</span>
                      </div>
                      {task.description && <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {importing ? (
              <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengimpor...</>
            ) : (
              `Import ${selected.size} Task ke Board`
            )}
          </button>
          {!defaultBoardId && (
            <p className="text-xs text-center text-amber-600">⚠️ Buat board di workspace ini dulu agar bisa import task</p>
          )}
        </div>
      )}
    </div>
  );
}
