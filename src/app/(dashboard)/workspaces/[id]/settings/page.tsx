import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail } from "@/features/workspace/services/workspace.service";
import { WorkspaceTabNav } from "@/features/workspace/components/workspace-tab-nav";
import { WorkspaceSettingsForm } from "@/features/workspace/components/workspace-settings-form";
import { WorkspaceDeleteButton } from "@/features/workspace/components/workspace-delete-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceSettingsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const workspace = await getWorkspaceDetail(id, user.id);
  if (!workspace) notFound();

  const accentColor = workspace.color ?? "#E21C70";
  const isOwner = workspace.owner_id === user.id;

  const cardStyle = {
    background: "rgba(30, 32, 72, 0.8)",
    border: "1px solid rgba(249,102,171,0.15)",
    borderRadius: "1rem",
    padding: "1.25rem",
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-0" style={{ borderBottom: "1px solid rgba(249,102,171,0.12)" }}>
        <div className="flex items-center gap-3 mb-4">
          {workspace.icon ? (
            <span className="text-3xl leading-none">{workspace.icon}</span>
          ) : (
            <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: accentColor }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>{workspace.description}</p>
            )}
          </div>
        </div>
        <WorkspaceTabNav workspaceId={id} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>
              Pengaturan Workspace
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>
              Kelola informasi dan preferensi workspace
            </p>
          </div>

          {/* Info workspace */}
          <div style={cardStyle}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "#F966AB" }}>Informasi Workspace</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: "rgba(233,207,232,0.4)" }}>Nama</p>
                <p className="font-medium" style={{ color: "#E9CFE8" }}>{workspace.name}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "rgba(233,207,232,0.4)" }}>Warna</p>
                <div className="flex items-center gap-2">
                  <span className="size-4 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="font-mono text-xs" style={{ color: "rgba(233,207,232,0.6)" }}>{accentColor}</span>
                </div>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "rgba(233,207,232,0.4)" }}>Anggota</p>
                <p className="font-medium" style={{ color: "#E9CFE8" }}>{workspace.member_count} anggota</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "rgba(233,207,232,0.4)" }}>Board</p>
                <p className="font-medium" style={{ color: "#E9CFE8" }}>{workspace.board_count} board</p>
              </div>
              {workspace.description && (
                <div className="col-span-2">
                  <p className="text-xs mb-1" style={{ color: "rgba(233,207,232,0.4)" }}>Deskripsi</p>
                  <p style={{ color: "rgba(233,207,232,0.8)" }}>{workspace.description}</p>
                </div>
              )}
            </div>
            {isOwner && (
              <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(249,102,171,0.1)" }}>
                <WorkspaceSettingsForm workspace={workspace} />
              </div>
            )}
          </div>

          {/* Danger zone */}
          {isOwner && (
            <div style={{ ...cardStyle, border: "1px solid rgba(255,75,110,0.25)", background: "rgba(255,75,110,0.05)" }}>
              <h3 className="font-semibold text-sm mb-2" style={{ color: "#ff4b6e" }}>Zona Berbahaya</h3>
              <p className="text-sm mb-4" style={{ color: "rgba(233,207,232,0.5)" }}>
                Menghapus workspace akan menghapus semua board, task, anggota, dan aktivitas secara permanen.
              </p>
              <WorkspaceDeleteButton workspace={workspace} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
