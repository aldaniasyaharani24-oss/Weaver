import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBoardTasks } from "@/features/task/services/task.service";
import { TaskList } from "@/features/task/components/task-list";
import { CreateTaskDialog } from "@/features/task/components/create-task-dialog";
import { BoardPageActions } from "@/features/board/components/board-page-actions";

interface BoardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: board } = await supabase.from("boards").select("*").eq("id", id).single();
  if (!board) notFound();

  if (board.workspace_id) {
    const { data: member } = await supabase
      .from("workspace_members").select("id")
      .eq("workspace_id", board.workspace_id).eq("user_id", user.id).maybeSingle();
    if (!member && board.user_id !== user.id) notFound();
  } else if (board.user_id !== user.id) {
    notFound();
  }

  const tasks = await getBoardTasks(id);

  let accentColor = "#E21C70";
  if (board.workspace_id) {
    const { data: ws } = await supabase.from("workspaces").select("color").eq("id", board.workspace_id).single();
    if (ws?.color) accentColor = ws.color;
  }

  const todoCount = tasks.filter(t => t.status === "todo").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div className="min-h-full board-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">

        {/* Breadcrumb */}
        <Link
          href={board.workspace_id ? `/workspaces/${board.workspace_id}/kanban` : "/dashboard"}
          className="board-breadcrumb inline-flex items-center gap-1.5 text-xs transition-colors">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Kanban
        </Link>

        {/* Board header — gradient pill */}
        <div className="board-header rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor})` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl flex items-center justify-center bg-white/25 text-white font-bold text-lg shrink-0">
              {board.title.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white leading-tight truncate"
                style={{ fontFamily: "var(--font-heading)" }}>
                {board.title}
              </h1>
              {board.description && (
                <p className="text-sm text-white/75 mt-0.5 truncate">{board.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CreateTaskDialog boardId={board.id}>
              <button type="button"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.25)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                + Tambah Task
              </button>
            </CreateTaskDialog>
            <BoardPageActions board={board} />
          </div>
        </div>

        {/* Column summary bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Todo", count: todoCount, dot: "board-dot-todo" },
            { label: "In Progress", count: inProgressCount, dot: "board-dot-progress" },
            { label: "Done", count: doneCount, dot: "board-dot-done" },
          ].map((s) => (
            <div key={s.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full board-col-pill">
              <span className={`size-2 rounded-full ${s.dot}`} />
              <span className="text-xs font-medium board-col-pill-text">{s.label}</span>
              <span className="text-xs font-bold board-col-pill-count">{s.count}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {/* Filter placeholder */}
            <div className="board-filter flex items-center gap-2 px-3 py-1.5 rounded-full text-xs">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span className="board-filter-text">Semua Task</span>
            </div>
            <div className="board-search flex items-center gap-2 px-3 py-1.5 rounded-full text-xs">
              <svg className="size-3.5 board-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="board-search-placeholder">Cari task...</span>
            </div>
          </div>
        </div>

        {/* Kanban columns */}
        <TaskList tasks={tasks} boardId={id} />
      </div>
    </div>
  );
}
