"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema, updateTaskSchema } from "../validation/task.schema";
import type { CreateTaskInput, UpdateTaskInput } from "../validation/task.schema";
import { logActivity } from "@/features/workspace/repository/activity.repository";

// Helper: ambil workspace_id dari board_id
async function getWorkspaceIdFromBoard(boardId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select("workspace_id")
    .eq("id", boardId)
    .single();
  return data?.workspace_id ?? null;
}

export async function createTask(formData: CreateTaskInput) {
  const validated = createTaskSchema.safeParse(formData);

  if (!validated.success) {
    return { error: "Data tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: lastTask } = await supabase
    .from("tasks")
    .select("position")
    .eq("board_id", validated.data.board_id)
    .eq("status", validated.data.status)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const newPosition = lastTask ? lastTask.position + 1 : 0;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      board_id: validated.data.board_id,
      user_id: user.id,
      title: validated.data.title,
      description: validated.data.description || null,
      priority: validated.data.priority,
      status: validated.data.status,
      position: newPosition,
      due_date: validated.data.due_date || null,
    })
    .select()
    .single();

  if (error || !task) {
    return { error: "Gagal membuat task" };
  }

  // Log aktivitas (fire-and-forget)
  const workspaceId = await getWorkspaceIdFromBoard(validated.data.board_id);
  if (workspaceId) {
    await logActivity({
      workspace_id: workspaceId,
      user_id: user.id,
      entity_type: "task",
      entity_id: task.id,
      entity_title: task.title,
      action: "created",
    });
    revalidatePath(`/workspaces/${workspaceId}/kanban`);
    revalidatePath(`/workspaces/${workspaceId}`);
  }
  revalidatePath(`/board/${validated.data.board_id}`);

  return { success: true };
}

export async function updateTask(formData: UpdateTaskInput) {
  const validated = updateTaskSchema.safeParse(formData);

  if (!validated.success) {
    return { error: "Data tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Ambil status lama untuk deteksi "completed"
  const { data: existing } = await supabase
    .from("tasks")
    .select("status, title")
    .eq("id", validated.data.id)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      priority: validated.data.priority,
      status: validated.data.status,
      due_date: validated.data.due_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.data.id);

  if (error) {
    return { error: "Gagal update task" };
  }

  const workspaceId = await getWorkspaceIdFromBoard(validated.data.board_id);
  if (workspaceId) {
    const wasMoved = existing?.status !== validated.data.status;
    const isCompleted = validated.data.status === "done" && existing?.status !== "done";

    await logActivity({
      workspace_id: workspaceId,
      user_id: user.id,
      entity_type: "task",
      entity_id: validated.data.id,
      entity_title: validated.data.title,
      action: isCompleted ? "completed" : wasMoved ? "moved" : "updated",
      meta: wasMoved
        ? { from: existing?.status, to: validated.data.status }
        : undefined,
    });
  }

  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Ambil task data sebelum hapus
  const { data: existing } = await supabase
    .from("tasks")
    .select("title, board_id")
    .eq("id", taskId)
    .single();

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .select();

  if (error) {
    return { error: `Gagal menghapus task: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { error: "Task tidak ditemukan atau tidak memiliki akses" };
  }

  if (existing?.board_id) {
    const workspaceId = await getWorkspaceIdFromBoard(existing.board_id);
    if (workspaceId) {
      await logActivity({
        workspace_id: workspaceId,
        user_id: user.id,
        entity_type: "task",
        entity_id: taskId,
        entity_title: existing.title,
        action: "deleted",
      });
    }
  }

  return { success: true };
}

export interface ReorderTask {
  id: string;
  status: string;
  position: number;
}

export async function reorderTasks(tasks: ReorderTask[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  for (const task of tasks) {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: task.status,
        position: task.position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (error) {
      return { error: "Gagal menyimpan perubahan" };
    }
  }

  return { success: true };
}
