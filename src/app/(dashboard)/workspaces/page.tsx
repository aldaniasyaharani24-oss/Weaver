import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { WorkspaceList } from "@/features/workspace/components/workspace-list";

export default async function WorkspacesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const workspaces = user ? await getUserWorkspaces(user.id) : [];

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#E9CFE8", fontFamily: "var(--font-heading)" }}>
          Semua Proyek
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(233,207,232,0.5)" }}>
          Kelola semua workspace dan proyek Anda
        </p>
      </div>
      <WorkspaceList workspaces={workspaces} />
    </div>
  );
}
