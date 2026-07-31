import {
  getWorkspacesByUserId,
  getWorkspaceById,
  getWorkspaceOverview,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../repository/workspace.repository";
import type { Workspace, WorkspaceWithStats, WorkspaceOverview } from "../types/workspace";

export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithStats[]> {
  return getWorkspacesByUserId(userId);
}

export async function getWorkspaceDetail(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceWithStats | null> {
  return getWorkspaceById(workspaceId, userId);
}

export async function createNewWorkspace(
  payload: Omit<Workspace, "id" | "created_at" | "updated_at">,
  userId: string,
): Promise<Workspace> {
  return createWorkspace(payload, userId);
}

export async function editWorkspace(
  workspaceId: string,
  payload: Partial<Pick<Workspace, "name" | "description" | "icon" | "color">>,
  userId: string,
): Promise<void> {
  return updateWorkspace(workspaceId, payload, userId);
}

export async function removeWorkspace(workspaceId: string, userId: string): Promise<void> {
  return deleteWorkspace(workspaceId, userId);
}

export async function getOverview(workspaceId: string): Promise<WorkspaceOverview> {
  return getWorkspaceOverview(workspaceId);
}
