import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, LogActivityPayload } from "../types/workspace";

export async function logActivity(payload: LogActivityPayload): Promise<void> {
  const supabase = await createClient();

  // Fire-and-forget: jangan block caller kalau log gagal
  await supabase.from("activity_logs").insert({
    workspace_id: payload.workspace_id,
    user_id: payload.user_id,
    entity_type: payload.entity_type,
    entity_id: payload.entity_id ?? null,
    entity_title: payload.entity_title ?? null,
    action: payload.action,
    meta: payload.meta ?? null,
  });
}

export async function getWorkspaceActivities(
  workspaceId: string,
  limit = 20,
): Promise<ActivityLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
      profiles!activity_logs_user_id_fkey (
        full_name,
        avatar_url
      )
    `,
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    entity_title: row.entity_title,
    action: row.action,
    meta: row.meta,
    created_at: row.created_at,
    actor_name: row.profiles?.full_name ?? null,
    actor_avatar: row.profiles?.avatar_url ?? null,
  }));
}

export async function getAllUserActivities(
  workspaceIds: string[],
  limit = 20,
): Promise<(ActivityLog & { workspace_name?: string | null })[]> {
  if (workspaceIds.length === 0) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
      profiles!activity_logs_user_id_fkey (
        full_name,
        avatar_url
      ),
      workspaces!activity_logs_workspace_id_fkey (
        name
      )
    `,
    )
    .in("workspace_id", workspaceIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    entity_title: row.entity_title,
    action: row.action,
    meta: row.meta,
    created_at: row.created_at,
    actor_name: (row.profiles as any)?.full_name ?? null,
    actor_avatar: (row.profiles as any)?.avatar_url ?? null,
    workspace_name: (row.workspaces as any)?.name ?? null,
  }));
}
