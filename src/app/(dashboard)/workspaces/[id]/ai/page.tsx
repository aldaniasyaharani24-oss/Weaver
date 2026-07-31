import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail, getOverview } from "@/features/workspace/services/workspace.service";
import { WorkspacePageHeader } from "@/features/workspace/components/workspace-page-header";
import { AISummaryCard } from "@/features/ai/components/ai-summary-card";
import { AITaskGenerator } from "@/features/ai/components/ai-task-generator";
import { AIPriorityWidget } from "@/features/ai/components/ai-priority-widget";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceAIPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [workspace, overview] = await Promise.all([
    getWorkspaceDetail(id, user.id),
    getOverview(id),
  ]);
  if (!workspace) notFound();

  const { data: boards } = await supabase
    .from("boards").select("id, title").eq("workspace_id", id)
    .order("created_at", { ascending: true }).limit(5);

  const defaultBoardId = boards?.[0]?.id;

  return (
    <div className="flex flex-col min-h-full">
      <WorkspacePageHeader workspace={workspace} workspaceId={id} />

      <div className="flex-1 px-6 py-6">
        <div className="max-w-5xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>AI Assistant</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>
                Powered by Groq · Llama 3.3 70B — Gratis &amp; Cepat
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">AI aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AISummaryCard workspace={workspace} overview={overview} />
            <AIPriorityWidget
              workspaceName={workspace.name}
              overdueTasks={overview.overdue_list}
              upcomingTasks={overview.upcoming_deadlines}
            />
          </div>

          <AITaskGenerator
            workspaceId={id}
            workspaceName={workspace.name}
            defaultBoardId={defaultBoardId}
          />

          {boards && boards.length > 1 && (
            <div className="flex items-start gap-3 p-4 rounded-xl neon-border"
              style={{ background: "rgba(249,102,171,0.05)" }}>
              <svg className="size-4 shrink-0 mt-0.5" style={{ color: "#F966AB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-sm" style={{ color: "rgba(233,207,232,0.7)" }}>
                Task yang di-generate akan diimpor ke board pertama:{" "}
                <span className="font-semibold" style={{ color: "#F966AB" }}>{boards[0].title}</span>.
                Workspace ini punya {boards.length} board.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
