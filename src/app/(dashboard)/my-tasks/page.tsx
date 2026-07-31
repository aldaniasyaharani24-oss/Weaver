import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface TaskItem {
  id: string;
  board_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  created_at: string;
  boards: {
    title: string;
    workspace_id: string | null;
    workspaces: {
      name: string;
    } | null;
  } | null;
}

export default async function MyTasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Query all user tasks with board and workspace info
  const { data: tasksRaw, error } = await supabase
    .from("tasks")
    .select(`
      id,
      board_id,
      user_id,
      title,
      description,
      status,
      priority,
      due_date,
      created_at,
      boards!tasks_board_id_fkey (
        title,
        workspace_id,
        workspaces:workspace_id (
          name
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const tasks = (tasksRaw as any) as TaskItem[] || [];

  // Group tasks by Workspace Name
  const groupedTasks: Record<string, TaskItem[]> = {};

  tasks.forEach((task) => {
    const workspaceName = task.boards?.workspaces?.name || "Lainnya";
    if (!groupedTasks[workspaceName]) {
      groupedTasks[workspaceName] = [];
    }
    groupedTasks[workspaceName].push(task);
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
      
      {/* ── Header ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <svg className="size-6 text-basecamp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a.75.75 0 011.077-.107 48.597 48.597 0 003.52 2.766.75.75 0 01-1.076 1.077 48.72 48.72 0 00-3.52-2.767.75.75 0 01-.108-1.076z" />
          </svg>
          My Tasks
        </h1>
        <p className="text-xs text-white/50">
          Daftar seluruh pekerjaan yang ditugaskan kepada Anda di semua proyek aktif.
        </p>
      </div>

      {/* ── Central Card Container ── */}
      <div className="bg-[#141f28] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
        
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-bold text-white mb-2 text-base">Semua pekerjaan sudah selesai!</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto mb-6">
              Tidak ada task aktif yang ditugaskan ke Anda. Buat task di dalam Papan Kanban proyek Anda untuk melihatnya di sini.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-basecamp-green hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md select-none transition-colors"
            >
              Kembali ke Proyek
            </Link>
          </div>
        ) : (
          Object.keys(groupedTasks).map((workspaceName) => {
            const projectTasks = groupedTasks[workspaceName];

            return (
              <div key={workspaceName} className="space-y-4">
                {/* Project Header Group */}
                <h3 className="font-bold text-sm text-basecamp-green border-b border-white/5 pb-1 uppercase tracking-wider">
                  {workspaceName}
                </h3>

                <div className="divide-y divide-white/5">
                  {projectTasks.map((task) => {
                    const isDone = task.status === "done";
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;
                    
                    // Priority style
                    let priorityBadge = "bg-white/5 text-white/50";
                    if (task.priority === "urgent") priorityBadge = "bg-red-950/40 text-red-400 border border-red-900/30";
                    else if (task.priority === "high") priorityBadge = "bg-amber-950/40 text-amber-400 border border-amber-900/30";
                    else if (task.priority === "medium") priorityBadge = "bg-blue-950/40 text-blue-400 border border-blue-900/30";

                    return (
                      <div 
                        key={task.id}
                        className="py-3 flex items-center justify-between gap-4 group"
                      >
                        {/* Checkbox circle & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          {isDone ? (
                            <div className="size-5 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow">
                              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="size-5 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-basecamp-green transition-colors cursor-pointer" />
                          )}

                          <div className="min-w-0 flex flex-col">
                            <span 
                              className={`text-sm font-medium transition-colors ${
                                isDone ? "line-through text-white/30" : "text-white/85"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.boards && (
                              <span className="text-[10px] text-white/40 mt-0.5">
                                Papan: <span className="font-semibold text-white/50">{task.boards.title}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges (Priority & Due Date) */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityBadge}`}>
                            {task.priority}
                          </span>
                          
                          {task.due_date && (
                            <span 
                              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                isOverdue 
                                  ? "bg-red-950/20 text-red-400 border border-red-900/30" 
                                  : "text-white/40 bg-white/5"
                              }`}
                            >
                              {new Date(task.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          )}

                          {/* Link to Board */}
                          <Link
                            href={`/board/${task.board_id}`}
                            className="text-[10px] text-white/35 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all"
                          >
                            Buka
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
