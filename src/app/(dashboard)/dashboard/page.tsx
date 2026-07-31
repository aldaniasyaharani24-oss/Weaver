import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { listMembers } from "@/features/workspace/services/member.service";
import { getAllActivities } from "@/features/workspace/services/activity.service";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { InviteMemberDialog } from "@/features/workspace/components/invite-member-dialog";

function getRelativeTime(dateString: string) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatActivity(act: { actor_name?: string | null; entity_title?: string | null; entity_type?: string | null; action?: string | null; workspace_name?: string | null; meta?: Record<string, unknown> | null }) {
  const actor = act.actor_name || "Seseorang";
  const title = act.entity_title || "item";
  const project = act.workspace_name ? ` — ${act.workspace_name}` : "";
  let text = `${act.action} ${act.entity_type}: ${title}`;
  if (act.entity_type === "task") {
    if (act.action === "created") text = `added to-do: ${title}`;
    else if (act.action === "completed") text = `completed: ${title}`;
    else if (act.action === "moved") text = `moved: ${title}`;
    else if (act.action === "deleted") text = `deleted: ${title}`;
    else text = `updated: ${title}`;
  } else if (act.entity_type === "board") {
    text = act.action === "created" ? `created board: ${title}` : `${act.action} board: ${title}`;
  } else if (act.entity_type === "member") {
    text = act.action === "invited" ? `invited ${title}` : `${act.action} ${title}`;
  }
  return (
    <span className="text-xs db-activity-text leading-relaxed">
      <span className="font-semibold db-activity-actor">{actor}</span>{" "}
      <span>{text}</span>
      <span className="db-activity-project">{project}</span>
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

  const activities = await getAllActivities(workspaces.map((w) => w.id), 10).catch(() => []);
  const firstWorkspaceId = workspaces[0]?.id || "";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Col 1: Welcome & Actions ── */}
        <section className="lg:col-span-3 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight db-heading">
              Welcome, {firstName}
            </h2>
            <p className="text-xs db-muted">Kelola proyek Anda lebih efisien hari ini.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <CreateWorkspaceDialog>
              <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none db-action-btn">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New project
              </button>
            </CreateWorkspaceDialog>

            {firstWorkspaceId ? (
              <InviteMemberDialog workspaceId={firstWorkspaceId}>
                <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none db-action-btn">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Invite people
                </button>
              </InviteMemberDialog>
            ) : (
              <span className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none db-action-btn-disabled">
                <svg className="size-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Invite people
              </span>
            )}

            <Link href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all select-none db-action-btn">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Adminland
            </Link>
          </div>
        </section>

        {/* ── Col 2: Project cards ── */}
        <section className="lg:col-span-6">
          <div className="db-main-card rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="font-bold text-lg tracking-wider uppercase db-heading">
                WEAVER Workspace
              </h3>
              <p className="text-xs db-muted mt-1">
                Kelola proyek, tugas, dan kolaborasi tim dalam satu workspace.
              </p>
            </div>

            {workspacesWithMembers.length === 0 ? (
              <div className="text-center py-12 rounded-2xl db-empty-state">
                <div className="text-4xl mb-3">🚀</div>
                <h4 className="font-bold mb-1 db-heading">Buat Proyek Pertama Anda</h4>
                <p className="text-xs db-muted max-w-xs mx-auto mb-4">
                  Mulai kolaborasi tim Anda dengan membuat folder proyek.
                </p>
                <CreateWorkspaceDialog>
                  <button type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md select-none transition-colors"
                    style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                    Buat Proyek
                  </button>
                </CreateWorkspaceDialog>
              </div>
            ) : (
              <div className="space-y-4">
                {workspacesWithMembers.map((ws) => {
                  const accent = ws.color || "#E21C70";
                  return (
                    <Link key={ws.id} href={`/workspaces/${ws.id}`}
                      className="block rounded-2xl p-5 transition-all group relative overflow-hidden db-project-card">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />
                      <div className="flex flex-col min-h-[90px] justify-between pl-3">
                        <div>
                          <h4 className="font-bold text-base line-clamp-1 db-heading group-hover:text-[#E21C70] transition-colors">
                            {ws.name}
                          </h4>
                          <p className="text-xs mt-1 line-clamp-2 leading-relaxed db-muted">
                            {ws.description || "Proyek kolaborasi tim, to-dos, aktivitas, dan asisten kecerdasan buatan."}
                          </p>
                        </div>
                        <div className="flex items-center -space-x-1.5 overflow-hidden mt-4">
                          {ws.members.slice(0, 10).map((mem) => {
                            const initial = (mem.full_name || mem.email).charAt(0).toUpperCase();
                            return (
                              <div key={mem.user_id}
                                className="size-6 rounded-full ring-2 db-avatar-ring flex items-center justify-center text-[9px] font-bold text-white select-none uppercase"
                                style={{ backgroundColor: accent }}
                                title={mem.full_name || mem.email}>
                                {initial}
                              </div>
                            );
                          })}
                          {ws.members.length > 10 && (
                            <div className="size-6 rounded-full ring-2 db-avatar-ring db-avatar-extra text-[8px] font-bold flex items-center justify-center select-none">
                              +{ws.members.length - 10}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Col 3: Activity ── */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-2 db-activity-header">
            <h3 className="font-bold text-sm db-subheading">Most recent activity</h3>
            <Link href="/dashboard" className="text-xs db-muted hover:text-[#E21C70] transition-colors">View all</Link>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs db-muted text-center py-8">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="relative pl-2.5">
              <div className="absolute left-4 top-2.5 bottom-2.5 w-0.5 db-timeline-line" />
              <div className="space-y-5 relative">
                {activities.map((act) => {
                  const isCompleted = act.action === "completed";
                  return (
                    <div key={act.id} className="relative pl-6 flex items-start">
                      <div className="absolute left-[-11px] top-0.5">
                        {isCompleted ? (
                          <div className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                            <svg className="size-3 fill-current" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="size-4 rounded-full db-timeline-dot text-[8px] font-bold flex items-center justify-center shadow">
                            {act.actor_name ? act.actor_name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] db-muted font-medium">{getRelativeTime(act.created_at)}</span>
                        <div className="mt-0.5">{formatActivity(act)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
