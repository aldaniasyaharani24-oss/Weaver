"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { inviteMember, changeRole, kickMember } from "../services/member.service";
import { recordActivity } from "../services/activity.service";
import type { WorkspaceRole } from "../types/workspace";

const inviteSchema = z.object({
  workspace_id: z.string().uuid(),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

const updateRoleSchema = z.object({
  workspace_id: z.string().uuid(),
  target_user_id: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]),
});

const removeMemberSchema = z.object({
  workspace_id: z.string().uuid(),
  target_user_id: z.string().uuid(),
});

export async function inviteMemberAction(formData: {
  workspace_id: string;
  email: string;
  role?: WorkspaceRole;
}) {
  const validated = inviteSchema.safeParse(formData);
  if (!validated.success) {
    return { error: "Data tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const result = await inviteMember(
    validated.data.workspace_id,
    validated.data.email,
    validated.data.role as WorkspaceRole,
  );

  if (result.error) return { error: result.error };

  await recordActivity({
    workspace_id: validated.data.workspace_id,
    user_id: user.id,
    entity_type: "member",
    entity_title: validated.data.email,
    action: "invited",
  });

  revalidatePath(`/workspaces/${validated.data.workspace_id}/members`);
  revalidatePath(`/workspaces/${validated.data.workspace_id}`);
  return { success: true };
}

export async function updateMemberRoleAction(formData: {
  workspace_id: string;
  target_user_id: string;
  role: WorkspaceRole;
}) {
  const validated = updateRoleSchema.safeParse(formData);
  if (!validated.success) return { error: "Data tidak valid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const result = await changeRole(
    validated.data.workspace_id,
    validated.data.target_user_id,
    validated.data.role as WorkspaceRole,
    user.id,
  );

  if (result.error) return { error: result.error };

  await recordActivity({
    workspace_id: validated.data.workspace_id,
    user_id: user.id,
    entity_type: "member",
    entity_id: validated.data.target_user_id,
    action: "updated",
    meta: { new_role: validated.data.role },
  });

  revalidatePath(`/workspaces/${validated.data.workspace_id}/members`);
  return { success: true };
}

export async function removeMemberAction(formData: {
  workspace_id: string;
  target_user_id: string;
}) {
  const validated = removeMemberSchema.safeParse(formData);
  if (!validated.success) return { error: "Data tidak valid" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const result = await kickMember(
    validated.data.workspace_id,
    validated.data.target_user_id,
    user.id,
  );

  if (result.error) return { error: result.error };

  await recordActivity({
    workspace_id: validated.data.workspace_id,
    user_id: user.id,
    entity_type: "member",
    entity_id: validated.data.target_user_id,
    action: "removed",
  });

  revalidatePath(`/workspaces/${validated.data.workspace_id}/members`);
  revalidatePath(`/workspaces/${validated.data.workspace_id}`);
  return { success: true };
}
