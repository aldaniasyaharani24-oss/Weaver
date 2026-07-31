import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail } from "@/features/workspace/services/workspace.service";
import { getActivities } from "@/features/workspace/services/activity.service";
import { ActivityFeed } from "@/features/workspace/components/activity-feed";
import { WorkspacePageHeader } from "@/features/workspace/components/workspace-page-header";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceActivityPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [workspace, activities] = await Promise.all([
    getWorkspaceDetail(id, user.id),
    getActivities(id, 50),
  ]);
  if (!workspace) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <WorkspacePageHeader workspace={workspace} workspaceId={id} />
      <div className="flex-1 px-6 py-6 max-w-2xl">
        <div className="mb-4">
          <h2 className="font-semibold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>
            Log Aktivitas
          </h2>
          <p className="text-sm" style={{ color: "rgba(233,207,232,0.5)" }}>
            Semua aktivitas yang terjadi di workspace ini
          </p>
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
