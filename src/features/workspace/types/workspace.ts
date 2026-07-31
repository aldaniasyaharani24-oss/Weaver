export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export interface WorkspaceWithStats extends Workspace {
  member_count: number;
  board_count: number;
  task_count: number;
  // Progress 0–100
  progress: number;
}

// ─── Overview ────────────────────────────────────────────────

export interface OverviewTask {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  board_id: string;
  board_title: string;
  status: "todo" | "in_progress" | "done";
}

export interface BoardOverviewItem {
  id: string;
  title: string;
  task_count: number;
  done_count: number;
  progress: number;
}

export interface WorkspaceOverview {
  // Stat cards
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
  progress: number;
  // Deadline terdekat (7 hari ke depan, belum selesai)
  upcoming_deadlines: OverviewTask[];
  // Task terlambat
  overdue_list: OverviewTask[];
  // Progress per board
  board_progress: BoardOverviewItem[];
}

// ─── Members ─────────────────────────────────────────────────

export interface MemberWithProfile {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

// ─── Activity Log ─────────────────────────────────────────────

export type ActivityEntityType = "task" | "board" | "workspace" | "member" | "message" | "comment";
export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "moved"
  | "invited"
  | "removed"
  | "completed";

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_id: string;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  entity_title: string | null;
  action: ActivityAction;
  meta: Record<string, unknown> | null;
  created_at: string;
  // join dari profiles
  actor_name: string | null;
  actor_avatar: string | null;
}

export interface LogActivityPayload {
  workspace_id: string;
  user_id: string;
  entity_type: ActivityEntityType;
  entity_id?: string;
  entity_title?: string;
  action: ActivityAction;
  meta?: Record<string, unknown>;
}
