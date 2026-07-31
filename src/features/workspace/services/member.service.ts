import {
  getWorkspaceMembers,
  getMemberByEmail,
  inviteMemberById,
  updateMemberRole,
  removeMember,
  getMemberRole,
} from "../repository/member.repository";
import type { MemberWithProfile, WorkspaceRole } from "../types/workspace";

export async function listMembers(workspaceId: string): Promise<MemberWithProfile[]> {
  return getWorkspaceMembers(workspaceId);
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole = "member",
): Promise<{ error?: string }> {
  const { already_member, user_id } = await getMemberByEmail(workspaceId, email);

  if (!user_id) {
    return { error: "Pengguna dengan email tersebut tidak ditemukan. Pastikan mereka sudah mendaftar di aplikasi ini." };
  }

  if (already_member) {
    return { error: "Pengguna sudah menjadi anggota workspace ini." };
  }

  await inviteMemberById(workspaceId, user_id, role);
  return {};
}

export async function changeRole(
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole,
  requesterId: string,
): Promise<{ error?: string }> {
  const requesterRole = await getMemberRole(workspaceId, requesterId);
  if (requesterRole !== "owner" && requesterRole !== "admin") {
    return { error: "Tidak memiliki izin untuk mengubah role" };
  }

  await updateMemberRole(workspaceId, targetUserId, newRole);
  return {};
}

export async function kickMember(
  workspaceId: string,
  targetUserId: string,
  requesterId: string,
): Promise<{ error?: string }> {
  const requesterRole = await getMemberRole(workspaceId, requesterId);
  if (requesterRole !== "owner" && requesterRole !== "admin") {
    return { error: "Tidak memiliki izin untuk menghapus anggota" };
  }

  // Owner tidak bisa dihapus
  const targetRole = await getMemberRole(workspaceId, targetUserId);
  if (targetRole === "owner") {
    return { error: "Owner workspace tidak bisa dihapus" };
  }

  await removeMember(workspaceId, targetUserId);
  return {};
}
