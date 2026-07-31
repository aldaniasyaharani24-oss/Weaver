"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeMemberAction } from "../actions/member.actions";
import { MemberRoleSelect } from "./member-role-select";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MemberWithProfile, WorkspaceRole } from "../types/workspace";

const ROLE_BADGE: Record<WorkspaceRole, string> = {
  owner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  member: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  viewer: "bg-muted text-muted-foreground",
};

function Avatar({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? ""}
        className="size-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
}

function RemoveMemberButton({
  workspaceId,
  member,
}: {
  workspaceId: string;
  member: MemberWithProfile;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    const result = await removeMemberAction({
      workspace_id: workspaceId,
      target_user_id: member.user_id,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Anggota berhasil dihapus");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Anggota</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus{" "}
            <strong>{member.full_name ?? member.email}</strong> dari workspace ini?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface MemberListProps {
  members: MemberWithProfile[];
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}

export function MemberList({
  members,
  workspaceId,
  currentUserId,
  currentUserRole,
}: MemberListProps) {
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Anggota Workspace</h2>
          <p className="text-sm text-muted-foreground">{members.length} anggota</p>
        </div>
        {canManage && (
          <InviteMemberDialog workspaceId={workspaceId}>
            <Button size="sm">+ Undang Anggota</Button>
          </InviteMemberDialog>
        )}
      </div>

      {/* List */}
      <div className="rounded-xl border border-border divide-y divide-border">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const canEdit = canManage && member.role !== "owner";

          return (
            <div
              key={member.id}
              className="flex items-center gap-4 px-4 py-3"
            >
              <Avatar name={member.full_name} avatarUrl={member.avatar_url} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {member.full_name ?? member.email}
                    {isCurrentUser && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(Anda)</span>
                    )}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${ROLE_BADGE[member.role]}`}
                  >
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>

              {/* Role select — hanya tampil kalau bisa manage */}
              {canEdit && (
                <MemberRoleSelect
                  workspaceId={workspaceId}
                  userId={member.user_id}
                  currentRole={member.role}
                />
              )}

              {/* Hapus — tidak bisa hapus diri sendiri atau owner */}
              {canEdit && !isCurrentUser && (
                <RemoveMemberButton workspaceId={workspaceId} member={member} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
