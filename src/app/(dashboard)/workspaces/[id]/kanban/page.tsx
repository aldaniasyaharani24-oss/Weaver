import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail, getOverview } from "@/features/workspace/services/workspace.service";
import { listMembers } from "@/features/workspace/services/member.service";
import { WorkspaceTabNav } from "@/features/workspace/components/workspace-tab-nav";
import { CreateBoardDialog } from "@/features/board/components/create-board-dialog";
import { BoardCardMenu } from "@/features/board/components/board-card-menu";

interface Props { params: Promise<{ id: string }> }

const BOARD_COLORS = [
  "#E21C70","#7c3aed","#059669","#d97706",
  "#dc2626","#2563eb","#db2777","#16a34a",
];
function getBoardColor(id: string) {
  return BOARD_COLORS[id.charCodeAt(0) % BOARD_COLORS.length];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} hari lalu`;
  if (h > 0) return `${h} jam lalu`;
  return "baru saja";
}

export default async function WorkspaceKanbanPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const workspace = await getWorkspaceDetail(id, user.id);
  if (!workspace) notFound();

  const overview = await getOverview(id);
  const members = await listMembers(id).catch(() => []);

  // Boards dengan task count detail
  const { data: boards } = await supabase
    .from("boards")
    .select("*, tasks:tasks(count, status)")
    .eq("workspace_id", id)
    .order("created_at", { ascending: true });

  const boardsData = (boards ?? []).map((b) => {
    const allTasks: { status: string }[] = b.tasks ?? [];
    const total = allTasks.length > 0
      ? (typeof allTasks[0] === "object" && "count" in allTasks[0]
        ? (allTasks[0] as { count: number }).count
        : allTasks.length)
      : 0;
    const done = allTasks.filter((t: { status: string }) => t.status === "done").length;
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      task_count: total,
      done_count: done,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      created_at: b.created_at,
      updated_at: b.updated_at,
      color: getBoardColor(b.id),
    };
  });

  const accentColor = workspace.color ?? "#E21C70";

  // Statistik workspace
  const stats = [
    { label: "Board", value: boardsData.length, icon: "📋", color: "#E21C70" },
    { label: "Task", value: overview.total_tasks, icon: "✅", color: "#059669" },
    { label: "Anggota", value: members.length, icon: "👥", color: "#7c3aed" },
    { label: "Deadline", value: overview.upcoming_deadlines.length + overview.overdue_list.length, icon: "⏰", color: "#d97706" },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Workspace header */}
      <div className="kanban-header px-6 pt-5 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
          {/* Left: workspace info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/dashboard" className="kanban-breadcrumb flex items-center gap-1 text-xs shrink-0">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {/* Workspace title + stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {workspace.icon ? (
              <span className="text-3xl">{workspace.icon}</span>
            ) : (
              <div className="size-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: accentColor }}>
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold kanban-title" style={{ fontFamily: "var(--font-heading)" }}>
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-sm kanban-sub mt-0.5">{workspace.description}</p>
              )}
              {/* Badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="kanban-badge-active px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  ● Active
                </span>
                <span className="kanban-badge px-2.5 py-0.5 rounded-full text-[11px]">
                  📋 {boardsData.length} Board
                </span>
                <span className="kanban-badge px-2.5 py-0.5 rounded-full text-[11px]">
                  👥 {members.length} Anggota
                </span>
                <span className="kanban-badge px-2.5 py-0.5 rounded-full text-[11px]">
                  ✅ {overview.total_tasks} Task Aktif
                </span>
                {overview.upcoming_deadlines.length > 0 && (
                  <span className="kanban-badge px-2.5 py-0.5 rounded-full text-[11px]">
                    📅 Deadline minggu ini
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <WorkspaceTabNav workspaceId={id} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Section header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold kanban-title" style={{ fontFamily: "var(--font-heading)" }}>
              Board Kanban
            </h2>
            <p className="text-sm kanban-sub mt-0.5">
              Kelola seluruh papan proyek tim dalam satu tempat. Pilih board untuk melihat task, progress, dan aktivitas terbaru.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search placeholder */}
            <div className="kanban-search flex items-center gap-2 px-3 py-2 rounded-xl text-sm">
              <svg className="size-4 kanban-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <span className="kanban-search-placeholder">Cari board...</span>
            </div>
            <CreateBoardDialog workspaceId={id}>
              <button type="button"
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", boxShadow: "0 4px 14px rgba(226,28,112,0.35)" }}>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                + Board Baru
              </button>
            </CreateBoardDialog>
          </div>
        </div>

        {/* Board cards grid */}
        {boardsData.length === 0 ? (
          <div className="kanban-empty rounded-2xl border-2 border-dashed p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold mb-2 kanban-title">Belum ada board</h3>
            <p className="text-sm mb-6 max-w-xs mx-auto kanban-sub">
              Board adalah tempat untuk mengorganisir task dengan kolom Todo, In Progress, dan Done.
            </p>
            <CreateBoardDialog workspaceId={id}>
              <button type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl"
                style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                Buat Board Pertama
              </button>
            </CreateBoardDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boardsData.map((board) => (
              <div key={board.id} className="kanban-board-card rounded-2xl overflow-hidden flex flex-col group">
                {/* Color accent line */}
                <div className="h-1 w-full" style={{ backgroundColor: board.color }} />

                <div className="flex-1 p-5 flex flex-col gap-3">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                        style={{ backgroundColor: board.color }}>
                        {board.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm kanban-title truncate group-hover:opacity-80 transition-opacity">
                          {board.title}
                        </h3>
                        {board.description && (
                          <p className="text-[11px] kanban-sub mt-0.5 line-clamp-2">{board.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.preventDefault()}>
                      <BoardCardMenu board={{ ...board, user_id: "", workspace_id: id } as Parameters<typeof BoardCardMenu>[0]["board"]} />
                    </div>
                  </div>

                  {/* Task count + progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs kanban-sub">{board.task_count} Task</span>
                      <span className="text-xs font-semibold" style={{ color: board.color }}>
                        {board.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full kanban-progress-bg overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${board.progress}%`, backgroundColor: board.color }} />
                    </div>
                  </div>

                  {/* Footer: member avatars + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-1.5">
                      {members.slice(0, 3).map((mem) => {
                        const initial = (mem.full_name || mem.email).charAt(0).toUpperCase();
                        return (
                          <div key={mem.user_id}
                            className="size-6 rounded-full border-2 kanban-avatar-ring flex items-center justify-center text-[9px] font-bold text-white select-none uppercase"
                            style={{ backgroundColor: board.color }}
                            title={mem.full_name || mem.email}>
                            {initial}
                          </div>
                        );
                      })}
                      {members.length > 3 && (
                        <div className="size-6 rounded-full border-2 kanban-avatar-ring kanban-avatar-extra flex items-center justify-center text-[9px] font-bold select-none">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] kanban-sub flex items-center gap-1">
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {timeAgo(board.updated_at || board.created_at)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-5 pb-5">
                  <Link href={`/board/${board.id}`}
                    className="kanban-board-btn flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Buka Board
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
