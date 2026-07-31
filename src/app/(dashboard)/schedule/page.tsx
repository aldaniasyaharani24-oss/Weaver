import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";

interface TaskWithMeta {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string;
  board_id: string;
  board_title: string;
  workspace_name: string;
  workspace_color: string;
}

function getDaysLeft(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PRIORITY_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: "Urgent",  color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
  high:   { label: "Tinggi",  color: "#F966AB", bg: "rgba(249,102,171,0.1)", border: "rgba(249,102,171,0.25)" },
  medium: { label: "Sedang",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)" },
  low:    { label: "Rendah",  color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)" },
};

const STATUS_DOT: Record<string, string> = {
  todo:        "bg-white/30",
  in_progress: "bg-amber-400",
  done:        "bg-emerald-500",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaces = await getUserWorkspaces(user.id).catch(() => []);
  if (workspaces.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-2xl font-bold text-white">Jadwal</h1>
        <div className="rounded-2xl border-2 border-dashed p-16 text-center"
          style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}>
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada jadwal</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(233,207,232,0.5)" }}>
            Buat workspace dan tambahkan due date pada task untuk melihat jadwal di sini.
          </p>
          <Link href="/workspaces"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl"
            style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
            Buka Workspace
          </Link>
        </div>
      </div>
    );
  }

  // Kumpulkan semua board IDs dari semua workspace
  const workspaceIds = workspaces.map(w => w.id);
  const { data: boards } = await supabase
    .from("boards").select("id, title, workspace_id").in("workspace_id", workspaceIds);

  const boardIds = (boards ?? []).map(b => b.id);
  const boardMap: Record<string, { title: string; workspaceId: string }> = {};
  for (const b of boards ?? []) boardMap[b.id] = { title: b.title, workspaceId: b.workspace_id };

  const workspaceMap: Record<string, { name: string; color: string }> = {};
  for (const w of workspaces) workspaceMap[w.id] = { name: w.name, color: w.color ?? "#E21C70" };

  let allTasks: TaskWithMeta[] = [];
  if (boardIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, board_id")
      .in("board_id", boardIds)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true });

    allTasks = (tasks ?? []).map(t => {
      const board = boardMap[t.board_id];
      const ws = workspaceMap[board?.workspaceId ?? ""] ?? { name: "Lainnya", color: "#E21C70" };
      return {
        ...t,
        due_date: t.due_date!,
        board_title: board?.title ?? "Board",
        workspace_name: ws.name,
        workspace_color: ws.color,
      } as TaskWithMeta;
    });
  }

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const overdue  = allTasks.filter(t => new Date(t.due_date) < now && t.status !== "done");
  const upcoming = allTasks.filter(t => new Date(t.due_date) >= now && t.status !== "done");
  const done     = allTasks.filter(t => t.status === "done");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="size-6" style={{ color: "#F966AB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Jadwal
        </h1>
        <p className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>
          Semua task dengan deadline dari seluruh workspace Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Terlambat", count: overdue.length, color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
          { label: "Mendatang", count: upcoming.length, color: "#F966AB", bg: "rgba(249,102,171,0.08)", border: "rgba(249,102,171,0.2)" },
          { label: "Selesai",   count: done.length,     color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {allTasks.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-16 text-center"
          style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}>
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada task dengan deadline</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(233,207,232,0.5)" }}>
            Tambahkan due date pada task di Kanban board untuk memantau jadwal.
          </p>
          <Link href="/workspaces"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl"
            style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
            Buka Workspace
          </Link>
        </div>
      )}

      {/* Terlambat */}
      {overdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-400" />
            <h2 className="text-sm font-bold" style={{ color: "#f87171" }}>Terlambat ({overdue.length})</h2>
          </div>
          <div className="space-y-2">
            {overdue.map(task => {
              const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low;
              const days = Math.abs(getDaysLeft(task.due_date));
              return (
                <Link key={task.id} href={`/board/${task.board_id}`}
                  className="flex items-center gap-3 rounded-xl p-3.5 transition-all"
                  style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <div className="size-9 rounded-xl flex items-center justify-center shrink-0 text-red-400"
                    style={{ background: "rgba(248,113,113,0.15)" }}>
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#E9CFE8" }}>{task.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(233,207,232,0.4)" }}>
                      {task.workspace_name} · {task.board_title} · <span style={{ color: "#f87171" }}>{days}h lalu</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}>
                    {p.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Mendatang */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: "#F966AB" }} />
            <h2 className="text-sm font-bold" style={{ color: "#E9CFE8" }}>Mendatang ({upcoming.length})</h2>
          </div>
          <div className="space-y-2">
            {upcoming.map(task => {
              const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low;
              const daysLeft = getDaysLeft(task.due_date);
              const isToday    = daysLeft === 0;
              const isTomorrow = daysLeft === 1;
              const isSoon     = daysLeft <= 3;
              const dateLabel  = isToday ? "Hari ini!" : isTomorrow ? "Besok" : `${daysLeft}h lagi`;
              const dateColor  = isToday ? "#F966AB" : isTomorrow ? "#fbbf24" : "rgba(233,207,232,0.4)";
              return (
                <Link key={task.id} href={`/board/${task.board_id}`}
                  className="flex items-center gap-3 rounded-xl p-3.5 transition-all"
                  style={{
                    background: "rgba(30,32,72,0.8)",
                    border: `1px solid ${isToday ? "rgba(249,102,171,0.4)" : isSoon ? "rgba(249,102,171,0.2)" : "rgba(249,102,171,0.1)"}`,
                  }}>
                  <div className="size-9 rounded-xl flex flex-col items-center justify-center shrink-0 text-white text-center"
                    style={{ backgroundColor: isToday ? "#E21C70" : isSoon ? "#AE0849" : task.workspace_color }}>
                    <span className="text-[8px] font-bold leading-none">
                      {new Date(task.due_date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold leading-tight">{new Date(task.due_date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#E9CFE8" }}>{task.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(233,207,232,0.4)" }}>
                      {task.workspace_name} · {task.board_title} ·{" "}
                      <span style={{ color: dateColor }}>{dateLabel}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}>
                    {p.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Selesai */}
      {done.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-bold" style={{ color: "rgba(233,207,232,0.4)" }}>Selesai ({done.length})</h2>
          </div>
          <div className="space-y-2">
            {done.slice(0, 5).map(task => {
              const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low;
              return (
                <Link key={task.id} href={`/board/${task.board_id}`}
                  className="flex items-center gap-3 rounded-xl p-3.5 opacity-50 hover:opacity-80 transition-all"
                  style={{ background: "rgba(30,32,72,0.5)", border: "1px solid rgba(249,102,171,0.08)" }}>
                  <div className="size-9 rounded-xl flex items-center justify-center shrink-0 text-emerald-400"
                    style={{ background: "rgba(52,211,153,0.1)" }}>
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-through truncate" style={{ color: "rgba(233,207,232,0.4)" }}>{task.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(233,207,232,0.3)" }}>
                      {task.workspace_name} · {task.board_title}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}>
                    {p.label}
                  </span>
                </Link>
              );
            })}
            {done.length > 5 && (
              <p className="text-xs text-center py-2" style={{ color: "rgba(233,207,232,0.35)" }}>
                +{done.length - 5} task selesai lainnya
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
