import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { listMembers } from "@/features/workspace/services/member.service";
import { getAllActivities } from "@/features/workspace/services/activity.service";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { InviteMemberDialog } from "@/features/workspace/components/invite-member-dialog";

function getRelativeTime(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m lalu`;
  if (h < 24) return `${h}j lalu`;
  return `${d}h lalu`;
}

function formatActivity(act: { actor_name?: string | null; entity_title?: string | null; entity_type?: string | null; action?: string | null; workspace_name?: string | null; meta?: Record<string, unknown> | null }) {
  const actor = act.actor_name || "Seseorang";
  const title = act.entity_title || "item";
  let text = "";
  if (act.entity_type === "task") {
    if (act.action === "created") text = `menambahkan task "${title}"`;
    else if (act.action === "completed") text = `menyelesaikan "${title}"`;
    else if (act.action === "moved") text = `memindahkan "${title}"`;
    else text = `mengubah "${title}"`;
  } else if (act.entity_type === "board") {
    text = act.action === "created" ? `membuat board "${title}"` : `mengubah board "${title}"`;
  } else if (act.entity_type === "member") {
    text = act.action === "invited" ? `mengundang ${title}` : `mengubah ${title}`;
  } else {
    text = `${act.action} ${title}`;
  }
  return (
    <span className="text-xs leading-relaxed db-activity-text">
      <span className="font-semibold db-activity-actor">{actor}</span>{" "}{text}
      {act.workspace_name && <span className="db-activity-project"> · {act.workspace_name}</span>}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, workspaces] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    getUserWorkspaces(user.id).catch(() => []),
  ]);

  const fullName = profileResult.data?.full_name ?? "";
  const firstName = fullName.split(" ")[0] || user.email?.split("@")[0] || "User";

  const workspacesWithMembers = await Promise.all(
    workspaces.map(async (ws) => ({
      ...ws,
      members: await listMembers(ws.id).catch(() => []),
    }))
  );

  const activities = await getAllActivities(workspaces.map((w) => w.id), 8).catch(() => []);
  const firstWorkspaceId = workspaces[0]?.id || "";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  return (
    <div className="min-h-full">
      {/* ── Page Header ── */}
      <div className="px-4 sm:px-6 pt-6 pb-4 border-b db-page-header-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold db-heading" style={{ fontFamily: "var(--font-heading)" }}>
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-sm db-muted mt-0.5">Kelola proyek Anda lebih efisien hari ini.</p>
          </div>
          <CreateWorkspaceDialog>
            <button type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", boxShadow: "0 4px 14px rgba(226,28,112,0.3)" }}>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Buat Proyek
            </button>
          </CreateWorkspaceDialog>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Quick actions — row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/workspaces"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all db-action-btn">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Semua Proyek
          </Link>

          {firstWorkspaceId ? (
            <InviteMemberDialog workspaceId={firstWorkspaceId}>
              <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all db-action-btn">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Undang Anggota
              </button>
            </InviteMemberDialog>
          ) : null}
        </div>

        {/* ── Desktop: 2 kolom | Mobile: 1 kolom ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Workspace list — 3/5 lebar */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold db-heading">Proyek Aktif</h2>
              <Link href="/workspaces" className="text-xs db-muted hover:opacity-70 transition-opacity">
                Lihat semua →
              </Link>
            </div>

            {workspacesWithMembers.length === 0 ? (
              <div className="weaver-card rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-bold mb-1 db-heading">Belum ada proyek</h3>
                <p className="text-xs db-muted max-w-xs mx-auto mb-4">
                  Buat proyek pertama untuk mulai berkolaborasi dengan tim.
                </p>
                <CreateWorkspaceDialog>
                  <button type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                    + Buat Proyek
                  </button>
                </CreateWorkspaceDialog>
              </div>
            ) : (
              <div className="space-y-3">
                {workspacesWithMembers.map((ws) => {
                  const accent = ws.color || "#E21C70";
                  return (
                    <Link key={ws.id} href={`/workspaces/${ws.id}`}
                      className="weaver-card rounded-2xl p-4 flex items-center gap-4 group block">
                      {/* Accent icon */}
                      <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                        style={{ backgroundColor: accent }}>
                        {ws.icon || ws.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate db-heading group-hover:opacity-75 transition-opacity">
                            {ws.name}
                          </h3>
                          <svg className="size-3.5 db-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                        <p className="text-xs db-muted truncate">
                          {ws.description || "Klik untuk membuka proyek"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {/* Progress bar */}
                          <div className="flex-1 h-1 rounded-full db-timeline-line overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${ws.progress}%`, backgroundColor: accent }} />
                          </div>
                          <span className="text-[10px] font-semibold db-muted shrink-0">{ws.progress}%</span>
                          {/* Avatars */}
                          <div className="flex items-center -space-x-1.5">
                            {ws.members.slice(0, 4).map((mem) => (
                              <div key={mem.user_id}
                                className="size-5 rounded-full ring-1 db-avatar-ring flex items-center justify-center text-[8px] font-bold text-white shrink-0 uppercase"
                                style={{ backgroundColor: accent }}>
                                {(mem.full_name || mem.email).charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {ws.members.length > 4 && (
                              <div className="size-5 rounded-full ring-1 db-avatar-ring db-avatar-extra text-[8px] font-bold flex items-center justify-center">
                                +{ws.members.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity feed — 2/5 lebar */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold db-heading">Aktivitas Terbaru</h2>
            </div>

            <div className="weaver-card rounded-2xl p-4">
              {activities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs db-muted">Belum ada aktivitas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => {
                    const isCompleted = act.action === "completed";
                    return (
                      <div key={act.id} className="flex items-start gap-3">
                        {/* Dot */}
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <svg className="size-3 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="size-5 rounded-full db-timeline-dot flex items-center justify-center text-[8px] font-bold">
                              {act.actor_name ? act.actor_name.charAt(0).toUpperCase() : "?"}
                            </div>
                          )}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          {formatActivity(act)}
                          <p className="text-[10px] db-muted mt-0.5">{getRelativeTime(act.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
