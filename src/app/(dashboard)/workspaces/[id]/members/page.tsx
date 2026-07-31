import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDetail } from "@/features/workspace/services/workspace.service";
import { listMembers } from "@/features/workspace/services/member.service";
import { getMemberRole } from "@/features/workspace/repository/member.repository";
import { MemberList } from "@/features/workspace/components/member-list";
import { WorkspacePageHeader } from "@/features/workspace/components/workspace-page-header";
import type { WorkspaceRole } from "@/features/workspace/types/workspace";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceMembersPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [workspace, members, currentUserRole] = await Promise.all([
    getWorkspaceDetail(id, user.id),
    listMembers(id),
    getMemberRole(id, user.id),
  ]);
  if (!workspace) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <WorkspacePageHeader workspace={workspace} workspaceId={id} />
      <div className="flex-1 px-6 py-6">
        <MemberList
          members={members}
          workspaceId={id}
          currentUserId={user.id}
          currentUserRole={(currentUserRole ?? "viewer") as WorkspaceRole}
        />
      </div>
    </div>
  );
}
