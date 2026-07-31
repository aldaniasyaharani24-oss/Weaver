import { logActivity, getWorkspaceActivities, getAllUserActivities } from "../repository/activity.repository";
import type { ActivityLog, LogActivityPayload } from "../types/workspace";

export async function recordActivity(payload: LogActivityPayload): Promise<void> {
  return logActivity(payload);
}

export async function getActivities(
  workspaceId: string,
  limit = 20,
): Promise<ActivityLog[]> {
  return getWorkspaceActivities(workspaceId, limit);
}

export async function getAllActivities(
  workspaceIds: string[],
  limit = 20,
): Promise<(ActivityLog & { workspace_name?: string | null })[]> {
  return getAllUserActivities(workspaceIds, limit);
}
