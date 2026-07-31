import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail } from "@/features/workspace/services/workspace.service";
import { listMessages } from "@/features/message/services/message.service";
import { WorkspacePageHeader } from "@/features/workspace/components/workspace-page-header";
import { CreateMessageDialog } from "@/features/message/components/create-message-dialog";

interface MessagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [workspace, messages] = await Promise.all([
    getWorkspaceDetail(id, user.id),
    listMessages(id),
  ]);
  if (!workspace) notFound();

  const accentColor = workspace.color ?? "#E21C70";

  return (
    <div className="flex flex-col min-h-full">
      <WorkspacePageHeader workspace={workspace} workspaceId={id} />

      <div className="flex-1 px-6 py-6">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>
                Message Board
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>
                Pengumuman, diskusi, dan informasi penting proyek
              </p>
            </div>
            <CreateMessageDialog workspaceId={id}>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-all animate-web-pulse"
                style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Buat Pesan
              </button>
            </CreateMessageDialog>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-16 text-center"
              style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}>
              <div className="text-5xl mb-4">💬</div>
              <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada pesan</h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "rgba(233,207,232,0.5)" }}>
                Buat pengumuman atau mulai diskusi dengan tim Anda
              </p>
              <CreateMessageDialog workspaceId={id}>
                <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-colors"
                  style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
                  + Buat Pesan Pertama
                </button>
              </CreateMessageDialog>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <Link key={msg.id} href={`/workspaces/${id}/messages/${msg.id}`}
                  className="flex items-start gap-4 p-5 rounded-2xl transition-all group card-hover"
                  style={{ background: "rgba(30,32,72,0.8)", border: "1px solid rgba(249,102,171,0.12)" }}>
                  <div className="size-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm uppercase select-none"
                    style={{ backgroundColor: accentColor }}>
                    {msg.author_name ? msg.author_name.charAt(0) : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="font-semibold line-clamp-1 transition-colors" style={{ color: "#E9CFE8" }}>
                        {msg.title}
                      </h3>
                      <span className="text-xs shrink-0 mt-0.5" style={{ color: "rgba(233,207,232,0.4)" }}>
                        {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "rgba(233,207,232,0.55)" }}>
                      {msg.content}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: "rgba(233,207,232,0.35)" }}>
                      Oleh <span className="font-medium" style={{ color: "#F966AB" }}>{msg.author_name ?? "Anggota"}</span>
                    </p>
                  </div>
                  <svg className="size-4 shrink-0 mt-1 transition-colors" style={{ color: "rgba(249,102,171,0.3)" }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
