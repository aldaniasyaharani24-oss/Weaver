export interface Board {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardWithTaskCount extends Board {
  task_count: number;
}
