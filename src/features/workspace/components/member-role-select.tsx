"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateMemberRoleAction } from "../actions/member.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkspaceRole } from "../types/workspace";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

interface MemberRoleSelectProps {
  workspaceId: string;
  userId: string;
  currentRole: WorkspaceRole;
  disabled?: boolean;
}

export function MemberRoleSelect({
  workspaceId,
  userId,
  currentRole,
  disabled,
}: MemberRoleSelectProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newRole: unknown) {
    setLoading(true);
    const result = await updateMemberRoleAction({
      workspace_id: workspaceId,
      target_user_id: userId,
      role: newRole as WorkspaceRole,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Role berhasil diubah");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleChange}
      disabled={disabled || loading || currentRole === "owner"}
    >
      <SelectTrigger className="w-28 h-7 text-xs">
        <SelectValue>{ROLE_LABELS[currentRole]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </SelectContent>
    </Select>
  );
}
