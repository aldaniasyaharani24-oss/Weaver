import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceWithStats } from "../types/workspace";

// Helper: hitung stats dari boards milik workspace tertentu
async function calcWorkspaceStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
): Promise<{ board_count: number; task_count: number; done_count: number }> {
  // Ambil semua boards milik workspace
  const { data: boards } = await supabase
    .from("boards")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (!boards || boards.length === 0) {
    return { board_count: 0, task_count: 0, done_count: 0 };
  }

  const boardIds = boards.map((b) => b.id);

  // Hitung total task
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .in("board_id", boardIds);

  // Hitung task selesai
  const { count: doneCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .in("board_id", boardIds)
    .eq("status", "done");

  return {
    board_count: boards.length,
    task_count: taskCount ?? 0,
    done_count: doneCount ?? 0,
  };
}

export async function getWorkspacesByUserId(userId: string): Promise<WorkspaceWithStats[]> {
  const supabase = await createClient();

  // 1. Ambil workspace_id yang user ikuti
  const { data: memberRows, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId);

  if (memberError || !memberRows?.length) return [];

  const workspaceIds = memberRows.map((m) => m.workspace_id);

  // 2. Ambil data workspace
  const { data: workspaces, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)
    .order("created_at", { ascending: false });

  if (wsError || !workspaces?.length) return [];

  // 3. Hitung member count per workspace
  const { data: memberCounts } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .in("workspace_id", workspaceIds);

  const memberCountMap: Record<string, number> = {};
  for (const row of memberCounts ?? []) {
    memberCountMap[row.workspace_id] = (memberCountMap[row.workspace_id] ?? 0) + 1;
  }

  // 4. Hitung stats per workspace (parallel)
  const statsArr = await Promise.all(
    workspaces.map((ws) => calcWorkspaceStats(supabase, ws.id)),
  );

  return workspaces.map((ws, i) => {
    const stats = statsArr[i];
    const progress =
      stats.task_count > 0
        ? Math.round((stats.done_count / stats.task_count) * 100)
        : 0;

    return {
      id: ws.id,
      owner_id: ws.owner_id,
      name: ws.name,
      description: ws.description,
      icon: ws.icon,
      color: ws.color,
      created_at: ws.created_at,
      updated_at: ws.updated_at,
      member_count: memberCountMap[ws.id] ?? 0,
      board_count: stats.board_count,
      task_count: stats.task_count,
      progress,
    };
  });
}

export async function getWorkspaceById(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceWithStats | null> {
  const supabase = await createClient();

  // Cek apakah user adalah member
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return null;

  // Ambil workspace
  const { data: ws, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (error || !ws) return null;

  // Hitung member count
  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // Hitung stats
  const stats = await calcWorkspaceStats(supabase, workspaceId);
  const progress =
    stats.task_count > 0
      ? Math.round((stats.done_count / stats.task_count) * 100)
      : 0;

  return {
    id: ws.id,
    owner_id: ws.owner_id,
    name: ws.name,
    description: ws.description,
    icon: ws.icon,
    color: ws.color,
    created_at: ws.created_at,
    updated_at: ws.updated_at,
    member_count: memberCount ?? 0,
    board_count: stats.board_count,
    task_count: stats.task_count,
    progress,
  };
}

export async function createWorkspace(
  payload: Omit<Workspace, "id" | "created_at" | "updated_at">,
  userId: string,
): Promise<Workspace> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspaces")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("Supabase error inserting workspace:", error);
    throw new Error(error?.message || "Gagal membuat workspace");
  }

  // Daftarkan creator sebagai owner
  await supabase.from("workspace_members").insert({
    workspace_id: data.id,
    user_id: userId,
    role: "owner",
  });

  return data;
}

export async function updateWorkspace(
  workspaceId: string,
  payload: Partial<Pick<Workspace, "name" | "description" | "icon" | "color">>,
  userId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", workspaceId)
    .eq("owner_id", userId);

  if (error) throw new Error("Gagal update workspace");
}

export async function deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("owner_id", userId);

  if (error) throw new Error("Gagal menghapus workspace");
}

export async function getWorkspaceOverview(
  workspaceId: string,
): Promise<import("../types/workspace").WorkspaceOverview> {
  const supabase = await createClient();
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const nowIso = now.toISOString();
  const in7DaysIso = in7Days.toISOString();

  // Ambil semua boards di workspace
  const { data: boardsRaw } = await supabase
    .from("boards")
    .select("id, title")
    .eq("workspace_id", workspaceId);

  const boards = boardsRaw ?? [];

  if (boards.length === 0) {
    return {
      total_tasks: 0,
      done_tasks: 0,
      overdue_tasks: 0,
      in_progress_tasks: 0,
      progress: 0,
      upcoming_deadlines: [],
      overdue_list: [],
      board_progress: [],
    };
  }

  const boardIds = boards.map((b) => b.id);

  // Ambil semua tasks sekaligus
  const { data: allTasksRaw } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, board_id")
    .in("board_id", boardIds);

  const allTasks = (allTasksRaw ?? []).map((t) => ({
    ...t,
    board_title: boards.find((b) => b.id === t.board_id)?.title ?? "",
  }));

  // Stats
  const total_tasks = allTasks.length;
  const done_tasks = allTasks.filter((t) => t.status === "done").length;
  const in_progress_tasks = allTasks.filter((t) => t.status === "in_progress").length;
  const overdue_tasks = allTasks.filter(
    (t) => t.due_date && t.due_date < nowIso && t.status !== "done",
  ).length;
  const progress = total_tasks > 0 ? Math.round((done_tasks / total_tasks) * 100) : 0;

  const upcoming_deadlines = allTasks
    .filter(
      (t) =>
        t.due_date &&
        t.due_date >= nowIso &&
        t.due_date <= in7DaysIso &&
        t.status !== "done",
    )
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority as "low" | "medium" | "high",
      due_date: t.due_date!,
      board_id: t.board_id,
      board_title: t.board_title,
      status: t.status as "todo" | "in_progress" | "done",
    }));

  const overdue_list = allTasks
    .filter((t) => t.due_date && t.due_date < nowIso && t.status !== "done")
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority as "low" | "medium" | "high",
      due_date: t.due_date!,
      board_id: t.board_id,
      board_title: t.board_title,
      status: t.status as "todo" | "in_progress" | "done",
    }));

  const board_progress = boards.map((board) => {
    const boardTasks = allTasks.filter((t) => t.board_id === board.id);
    const total = boardTasks.length;
    const done = boardTasks.filter((t) => t.status === "done").length;
    return {
      id: board.id,
      title: board.title,
      task_count: total,
      done_count: done,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  return {
    total_tasks,
    done_tasks,
    overdue_tasks,
    in_progress_tasks,
    progress,
    upcoming_deadlines,
    overdue_list,
    board_progress,
  };
}
