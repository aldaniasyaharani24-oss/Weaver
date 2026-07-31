import { createClient } from "@/lib/supabase/server";
import type { MemberWithProfile, WorkspaceRole } from "../types/workspace";

export async function getWorkspaceMembers(workspaceId: string): Promise<MemberWithProfile[]> {
  const supabase = await createClient();

  // Gunakan view workspace_members_with_profiles yang sudah dibuat di migration
  const { data, error } = await supabase
    .from("workspace_members_with_profiles")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error || !data) return [];

  return (data as MemberWithProfile[]);
}

export async function getMemberByEmail(
  workspaceId: string,
  email: string,
): Promise<{ already_member: boolean; user_id: string | null; full_name: string | null }> {
  const supabase = await createClient();

  let foundUserId: string | null = null;
  let foundFullName: string | null = null;

  // Strategi 1: cari via RPC (butuh migration 003)
  const { data: rpcRows, error: rpcError } = await supabase
    .rpc("get_user_id_by_email", { user_email: email });

  if (!rpcError && rpcRows && rpcRows.length > 0) {
    const row = rpcRows[0] as { user_id: string; full_name: string };
    foundUserId = row.user_id;
    foundFullName = row.full_name;
  }

  // Strategi 2: fallback — cari di profiles.email jika RPC gagal
  if (!foundUserId) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email)
      .maybeSingle();

    if (profileRow) {
      foundUserId = profileRow.id;
      foundFullName = profileRow.full_name;
    }
  }

  // Strategi 3: fallback — cari dari workspace_members_with_profiles (user yang sudah member di workspace lain)
  if (!foundUserId) {
    const { data: viewRow } = await supabase
      .from("workspace_members_with_profiles")
      .select("user_id, full_name")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (viewRow) {
      foundUserId = viewRow.user_id;
      foundFullName = viewRow.full_name;
    }
  }

  if (!foundUserId) {
    return { already_member: false, user_id: null, full_name: null };
  }

  // Cek apakah sudah jadi member di workspace ini
  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", foundUserId)
    .maybeSingle();

  return {
    already_member: !!existingMember,
    user_id: foundUserId,
    full_name: foundFullName,
  };
}

export async function inviteMemberById(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole = "member",
): Promise<void> {
  const supabase = await createClient();

  // Pakai SECURITY DEFINER function untuk bypass RLS circular dependency
  const { error } = await supabase.rpc("invite_workspace_member", {
    p_workspace_id: workspaceId,
    p_user_id: userId,
    p_role: role,
  });

  if (error) {
    // Tampilkan pesan error dari PostgreSQL jika ada
    throw new Error(error.message || "Gagal menambahkan anggota");
  }
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Gagal mengubah role anggota");
  }
}

export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Gagal menghapus anggota");
  }
}

export async function getMemberRole(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  return (data?.role as WorkspaceRole) ?? null;
}
