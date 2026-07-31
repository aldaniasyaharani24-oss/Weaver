import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail, getOverview } from "@/features/workspace/services/workspace.service";
import { getActivities } from "@/features/workspace/services/activity.service";
import { listMembers } from "@/features/workspace/services/member.service";
import { listMessages } from "@/features/message/services/message.service";
import { WorkspaceTabNav } from "@/features/workspace/components/workspace-tab-nav";
import { WorkspaceCardMenu } from "@/features/workspace/components/workspace-card-menu";
import { InviteMemberDialog } from "@/features/workspace/components/invite-member-dialog";

interface WorkspaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [workspace, overview, activities, members, messages] = await Promise.all([
    getWorkspaceDetail(id, user.id),
    getOverview(id),
    getActivities(id, 3),
    listMembers(id).catch(() => []),
    listMessages(id).catch(() => []),
  ]);

  if (!workspace) notFound();

  const accentColor = workspace.color ?? "#E21C70";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard"
          className="flex items-center gap-1 text-xs ov-muted hover:text-[#E21C70] transition-colors">
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Dashboard
        </Link>
        <WorkspaceCardMenu workspace={workspace} />
      </div>

      {/* Workspace header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {workspace.icon ? (
            <span className="text-4xl leading-none">{workspace.icon}</span>
          ) : (
            <div className="size-11 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ backgroundColor: accentColor }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight ov-heading" style={{ fontFamily: "var(--font-heading)" }}>
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-sm mt-0.5 max-w-2xl leading-relaxed ov-muted">{workspace.description}</p>
            )}
          </div>
        </div>
        <WorkspaceTabNav workspaceId={id} />
      </div>

      {/* 6 Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Message Board */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3 w-full">
            <Link href={`/workspaces/${id}/messages`}>
              <h3 className="font-bold text-base ov-card-title group-hover:text-[#BF0413] transition-colors flex items-center gap-2">
                <svg className="size-5 shrink-0" style={{ color: "#BF0413" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Message Board
              </h3>
            </Link>
            {messages.length === 0 ? (
              <>
                <p className="text-xs ov-muted italic">Belum ada pengumuman terbaru.</p>
                {/* Dekorasi jaring laba-laba */}
                <div className="flex items-center justify-center py-4 opacity-30">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    {[0,30,60,90,120,150].map((deg,i) => {
                      const r = (deg*Math.PI)/180;
                      return <line key={i} x1="40" y1="40" x2={40+Math.cos(r)*38} y2={40+Math.sin(r)*38} stroke="#BF0413" strokeWidth="1"/>;
                    })}
                    {[10,20,30,38].map(r => <circle key={r} cx="40" cy="40" r={r} stroke="#BF0413" strokeWidth="0.8" fill="none"/>)}
                    <circle cx="40" cy="40" r="4" fill="#BF0413"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="space-y-2 max-h-[130px] overflow-y-auto pr-1">
                {messages.slice(0, 3).map((msg) => (
                  <Link key={msg.id} href={`/workspaces/${id}/messages/${msg.id}`} className="block group/item">
                    <p className="text-xs font-semibold ov-card-title group-hover/item:text-[#BF0413] truncate transition-colors">{msg.title}</p>
                    <p className="text-[10px] ov-muted">{msg.author_name || "Anggota"} &middot; {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <Link href={`/workspaces/${id}/messages`}
              className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block">
              + Buat Pesan Baru
            </Link>
          </div>
        </div>

        {/* 2. To-dos / Kanban */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3 w-full">
            <h3 className="font-bold text-base ov-card-title group-hover:text-[#E21C70] transition-colors flex items-center gap-2">
              <svg className="size-5 shrink-0" style={{ color: "#E21C70" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              To-dos (Kanban)
            </h3>
            {overview.board_progress.length === 0 ? (
              <>
                <p className="text-xs ov-muted italic">Belum ada papan task di proyek ini.</p>
                {/* Dekorasi task cards */}
                <div className="flex items-center justify-center gap-2 py-4 opacity-25">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-14 h-16 rounded-lg border flex flex-col gap-1.5 p-1.5"
                      style={{ borderColor: "#BF0413", background: "rgba(191,4,19,0.1)" }}>
                      {[0,1,2].map(j => (
                        <div key={j} className="h-1.5 rounded-full" style={{ background: "#BF0413", width: `${70 - j*15}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                {overview.board_progress.map((board) => (
                  <Link key={board.id} href={`/board/${board.id}`} className="block group/item space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold ov-card-title group-hover/item:text-[#E21C70] truncate max-w-[150px]">{board.title}</span>
                      <span className="text-[10px] ov-muted">{board.done_count}/{board.task_count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full ov-progress-bg overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${board.progress}%`, backgroundColor: accentColor }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <Link href={`/workspaces/${id}/kanban`}
              className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block">
              Kelola Papan Kanban
            </Link>
          </div>
        </div>

        {/* 3. Aktivitas */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3 w-full">
            <h3 className="font-bold text-base ov-card-title group-hover:text-[#E21C70] transition-colors flex items-center gap-2">
              <svg className="size-5 shrink-0" style={{ color: "#E21C70" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.283 8.283 0 013.937-2.186 9.75 9.75 0 003.425-2.2z" />
              </svg>
              Campfire (Aktivitas)
            </h3>
            {activities.length === 0 ? (
              <>
                <p className="text-xs ov-muted italic">Belum ada aktivitas baru di campfire.</p>
                {/* Dekorasi api */}
                <div className="flex items-center justify-center py-4 opacity-30">
                  <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                    <ellipse cx="30" cy="60" rx="18" ry="5" fill="#BF0413" opacity="0.4"/>
                    <path d="M30 10 C20 25 10 30 15 45 C18 52 25 56 30 56 C35 56 42 52 45 45 C50 30 40 25 30 10Z" fill="#BF0413" opacity="0.7"/>
                    <path d="M30 22 C24 32 20 36 22 44 C24 49 27 52 30 52 C33 52 36 49 38 44 C40 36 36 32 30 22Z" fill="#8C0303" opacity="0.9"/>
                    <path d="M30 32 C27 38 26 41 28 45 C29 47 30 48 30 48 C30 48 31 47 32 45 C34 41 33 38 30 32Z" fill="#F2F2F2" opacity="0.6"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="text-xs ov-muted leading-relaxed">
                    <span className="font-semibold ov-card-title">{act.actor_name || "Anggota"}</span>{" "}
                    {act.action === "created" ? "menambahkan" : act.action === "completed" ? "menyelesaikan" : "mengubah"} task{" "}
                    <span className="font-medium" style={{ color: "#E21C70" }}>{act.entity_title || ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <Link href={`/workspaces/${id}/activity`}
              className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block">
              Lihat Semua Aktivitas
            </Link>
          </div>
        </div>

        {/* 4. AI Assistant */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3">
            <h3 className="font-bold text-base ov-card-title group-hover:text-[#E21C70] transition-colors flex items-center gap-2">
              <svg className="size-5 shrink-0" style={{ color: "#E21C70" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI Assistant
            </h3>
            <p className="text-xs ov-muted leading-relaxed">
              AI menganalisis risiko keterlambatan, memberikan ringkasan status proyek, dan mengurutkan prioritas.
            </p>
            <div className="ov-ai-badge rounded-xl p-3 text-[11px]">
              <span className="font-semibold block mb-1" style={{ color: "#E21C70" }}>Status Proyek:</span>
              <span className="ov-muted">Progress </span>
              <span className="font-bold ov-card-title">{overview.progress}%</span>
              <span className="ov-muted"> · </span>
              <span className="font-bold ov-card-title">{overview.total_tasks}</span>
              <span className="ov-muted"> total task</span>
            </div>
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <Link href={`/workspaces/${id}/ai`}
              className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block">
              Buka AI Assistant
            </Link>
          </div>
        </div>

        {/* 5. Team Members */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3 w-full">
            <h3 className="font-bold text-base ov-card-title group-hover:text-[#E21C70] transition-colors flex items-center gap-2">
              <svg className="size-5 shrink-0" style={{ color: "#E21C70" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Team Members ({members.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
              {members.map((mem) => {
                const initial = (mem.full_name || mem.email).charAt(0).toUpperCase();
                return (
                  <div key={mem.user_id}
                    className="flex items-center gap-2 ov-member-chip rounded-full pl-1.5 pr-3 py-1 text-[11px]">
                    <div className="size-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center select-none uppercase"
                      style={{ backgroundColor: accentColor }}>
                      {initial}
                    </div>
                    <span className="truncate max-w-[80px] ov-card-title">
                      {mem.full_name || mem.email.split("@")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <InviteMemberDialog workspaceId={id}>
              <button type="button"
                className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block cursor-pointer select-none">
                Undang Anggota
              </button>
            </InviteMemberDialog>
          </div>
        </div>

        {/* 6. Schedule & Deadlines */}
        <div className="ov-card rounded-2xl p-6 flex flex-col justify-between min-h-[290px] group">
          <div className="space-y-3 w-full">
            <h3 className="font-bold text-base ov-card-title group-hover:text-[#E21C70] transition-colors flex items-center gap-2">
              <svg className="size-5 shrink-0" style={{ color: "#E21C70" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Schedule & Deadlines
            </h3>
            {overview.upcoming_deadlines.length === 0 && overview.overdue_list.length === 0 ? (
              <p className="text-xs ov-muted italic">Tidak ada tenggat waktu terdekat.</p>
            ) : (
              <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                {overview.overdue_list.slice(0, 2).map((task) => (
                  <div key={task.id} className="text-xs rounded-lg p-2 flex flex-col"
                    style={{ background: "rgba(255,75,110,0.1)", border: "1px solid rgba(255,75,110,0.2)" }}>
                    <span className="font-semibold line-clamp-1" style={{ color: "#ff7b93" }}>{task.title}</span>
                    <span className="text-[10px] font-medium" style={{ color: "rgba(255,123,147,0.7)" }}>
                      Terlambat: {new Date(task.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
                {overview.upcoming_deadlines.slice(0, 2).map((task) => (
                  <div key={task.id} className="text-xs rounded-lg p-2 flex flex-col ov-deadline-item">
                    <span className="font-semibold line-clamp-1 ov-card-title">{task.title}</span>
                    <span className="text-[10px] font-medium ov-muted">
                      Tenggat: {new Date(task.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ov-card-divider pt-4 mt-4">
            <Link href={`/workspaces/${id}/schedule`}
              className="ov-card-btn text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-center block">
              Lihat Semua Jadwal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
