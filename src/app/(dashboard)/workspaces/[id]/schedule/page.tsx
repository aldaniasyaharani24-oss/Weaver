import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail } from "@/features/workspace/services/workspace.service";
import { WorkspacePageHeader } from "@/features/workspace/components/workspace-page-header";

interface Props {
  params: Promise<{ id: string }>;
}

type TaskWithBoard = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  board_id: string;
  board_title: string;
};

const PRIORITY_CONFIG = {
  high: { label: "Tinggi", cls: "text-[#F966AB]", bg: "rgba(249,102,171,0.12)", border: "rgba(249,102,171,0.25)" },
  medium: { label: "Sedang", cls: "text-amber-400", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
  low: { label: "Rendah", cls: "text-emerald-400", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
};

const STATUS_CONFIG = {
  todo: { label: "Todo", dot: "bg-white/30" },
  in_progress: { label: "In Progress", dot: "bg-amber-400" },
  done: { label: "Done", dot: "bg-emerald-500" },
};

function getDaysLeft(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function groupByMonth(tasks: TaskWithBoard[]): Record<string, TaskWithBoard[]> {
  const groups: Record<string, TaskWithBoard[]> = {};
  for (const task of tasks) {
    const key = new Date(task.due_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return groups;
}

const cardStyle = { background: "rgba(30,32,72,0.8)", border: "1px solid rgba(249,102,171,0.12)", borderRadius: "0.75rem", padding: "1rem" };

export default async function WorkspaceSchedulePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const workspace = await getWorkspaceDetail(id, user.id);
  if (!workspace) notFound();

  const { data: boards } = await supabase.from("boards").select("id, title").eq("workspace_id", id);
  const boardIds = (boards ?? []).map((b) => b.id);
  const boardMap: Record<string, string> = {};
  for (const b of boards ?? []) boardMap[b.id] = b.title;

  let allTasks: TaskWithBoard[] = [];
  if (boardIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks").select("id, title, status, priority, due_date, board_id")
      .in("board_id", boardIds).not("due_date", "is", null).order("due_date", { ascending: true });
    allTasks = (tasks ?? []).map((t) => ({ ...t, due_date: t.due_date!, board_title: boardMap[t.board_id] ?? "Board" })) as TaskWithBoard[];
  }

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const overdue = allTasks.filter((t) => new Date(t.due_date) < now && t.status !== "done");
  const upcoming = allTasks.filter((t) => new Date(t.due_date) >= now && t.status !== "done");
  const completed = allTasks.filter((t) => t.status === "done");
  const groupedUpcoming = groupByMonth(upcoming);
  const accentColor = workspace.color ?? "#E21C70";

  return (
    <div className="flex flex-col min-h-full">
      <WorkspacePageHeader workspace={workspace} workspaceId={id} />

      <div className="flex-1 px-6 py-6">
        <div className="max-w-4xl space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>Schedule & Deadlines</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>Semua task dengan tenggat waktu di workspace ini</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {overdue.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
                  style={{ background: "rgba(255,75,110,0.15)", border: "1px solid rgba(255,75,110,0.3)", color: "#ff7b93" }}>
                  <span className="size-1.5 rounded-full bg-red-400" />{overdue.length} terlambat
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
                style={{ background: "rgba(249,102,171,0.1)", border: "1px solid rgba(249,102,171,0.2)", color: "#F966AB" }}>
                <span className="size-1.5 rounded-full bg-[#F966AB]" />{upcoming.length} mendatang
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                <span className="size-1.5 rounded-full bg-emerald-400" />{completed.length} selesai
              </span>
            </div>
          </div>

          {/* Empty */}
          {allTasks.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed p-16 text-center"
              style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}>
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada task dengan deadline</h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "rgba(233,207,232,0.5)" }}>
                Tambahkan due date pada task di Kanban board untuk memantau jadwal proyek Anda.
              </p>
              <Link href={`/workspaces/${id}/kanban`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-colors"
                style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                Buka Kanban
              </Link>
            </div>
          )}

          {/* Overdue */}
          {overdue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-red-400" />
                <h3 className="text-sm font-bold" style={{ color: "#ff7b93" }}>Terlambat ({overdue.length})</h3>
              </div>
              <div className="space-y-2">
                {overdue.map((task) => {
                  const daysLeft = getDaysLeft(task.due_date);
                  const p = PRIORITY_CONFIG[task.priority];
                  const s = STATUS_CONFIG[task.status];
                  return (
                    <Link key={task.id} href={`/board/${task.board_id}`}
                      className="flex items-center gap-4 rounded-xl p-4 transition-all group card-hover"
                      style={{ background: "rgba(255,75,110,0.07)", border: "1px solid rgba(255,75,110,0.2)" }}>
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,75,110,0.15)" }}>
                        <svg className="size-5" style={{ color: "#ff7b93" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#E9CFE8" }}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: "rgba(233,207,232,0.4)" }}>{task.board_title}</span>
                          <span style={{ color: "rgba(233,207,232,0.2)" }}>·</span>
                          <span className="text-xs font-medium" style={{ color: "#ff7b93" }}>{Math.abs(daysLeft)} hari yang lalu</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.cls.replace("text-", "") }}>
                          {p.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`size-1.5 rounded-full ${s.dot}`} />
                          <span className="text-xs" style={{ color: "rgba(233,207,232,0.4)" }}>{s.label}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming by month */}
          {upcoming.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedUpcoming).map(([month, tasks]) => (
                <div key={month} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full" style={{ background: "#F966AB" }} />
                    <h3 className="text-sm font-bold" style={{ color: "#E9CFE8" }}>{month}</h3>
                    <div className="flex-1 h-px" style={{ background: "rgba(249,102,171,0.12)" }} />
                    <span className="text-xs" style={{ color: "rgba(233,207,232,0.4)" }}>{tasks.length} task</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const daysLeft = getDaysLeft(task.due_date);
                      const p = PRIORITY_CONFIG[task.priority];
                      const s = STATUS_CONFIG[task.status];
                      const isToday = daysLeft === 0;
                      const isTomorrow = daysLeft === 1;
                      const isSoon = daysLeft <= 3;
                      return (
                        <Link key={task.id} href={`/board/${task.board_id}`}
                          className="flex items-center gap-4 rounded-xl p-4 transition-all group card-hover"
                          style={{ background: "rgba(30,32,72,0.8)", border: `1px solid ${isToday ? "rgba(249,102,171,0.4)" : isSoon ? "rgba(249,102,171,0.2)" : "rgba(249,102,171,0.1)"}` }}>
                          <div className="size-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: isToday ? "#E21C70" : isSoon ? "#AE0849" : accentColor }}>
                            <span className="text-[10px] font-bold leading-none">
                              {new Date(task.due_date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}
                            </span>
                            <span className="text-sm font-bold leading-tight">{new Date(task.due_date).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "#E9CFE8" }}>{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs" style={{ color: "rgba(233,207,232,0.4)" }}>{task.board_title}</span>
                              <span style={{ color: "rgba(233,207,232,0.2)" }}>·</span>
                              <span className="text-xs font-medium" style={{ color: isToday ? "#F966AB" : isTomorrow ? "#fbbf24" : "rgba(233,207,232,0.4)" }}>
                                {isToday ? "Hari ini!" : isTomorrow ? "Besok" : `${daysLeft} hari lagi`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.cls.replace("text-", "") }}>
                              {p.label}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`size-1.5 rounded-full ${s.dot}`} />
                              <span className="text-xs" style={{ color: "rgba(233,207,232,0.4)" }}>{s.label}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold" style={{ color: "rgba(233,207,232,0.5)" }}>Selesai ({completed.length})</h3>
                <div className="flex-1 h-px" style={{ background: "rgba(249,102,171,0.08)" }} />
              </div>
              <div className="space-y-2">
                {completed.slice(0, 5).map((task) => {
                  const p = PRIORITY_CONFIG[task.priority];
                  return (
                    <Link key={task.id} href={`/board/${task.board_id}`}
                      className="flex items-center gap-4 rounded-xl p-4 transition-all group opacity-60 hover:opacity-100"
                      style={{ background: "rgba(30,32,72,0.5)", border: "1px solid rgba(249,102,171,0.08)" }}>
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(52,211,153,0.1)" }}>
                        <svg className="size-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate line-through" style={{ color: "rgba(233,207,232,0.4)" }}>{task.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(233,207,232,0.3)" }}>{task.board_title}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.cls.replace("text-", "") }}>
                        {p.label}
                      </span>
                    </Link>
                  );
                })}
                {completed.length > 5 && (
                  <p className="text-xs text-center py-2" style={{ color: "rgba(233,207,232,0.35)" }}>
                    + {completed.length - 5} task selesai lainnya
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
