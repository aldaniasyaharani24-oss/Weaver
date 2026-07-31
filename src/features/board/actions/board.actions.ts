"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createBoardSchema, updateBoardSchema } from "../validation/board.schema";
import type { CreateBoardInput, UpdateBoardInput } from "../validation/board.schema";
import { logActivity } from "@/features/workspace/repository/activity.repository";

export async function createBoard(formData: CreateBoardInput) {
  const validated = createBoardSchema.safeParse(formData);

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

  const { data: board, error } = await supabase
    .from("boards")
    .insert({
      user_id: user.id,
      workspace_id: validated.data.workspace_id ?? null,
      title: validated.data.title,
      description: validated.data.description || null,
    })
    .select()
    .single();

  if (error || !board) {
    return { error: "Gagal membuat board" };
  }

  // Log aktivitas jika board terhubung ke workspace
  if (board.workspace_id) {
    await logActivity({
      workspace_id: board.workspace_id,
      user_id: user.id,
      entity_type: "board",
      entity_id: board.id,
      entity_title: board.title,
      action: "created",
    });
  }

  if (validated.data.workspace_id) {
    revalidatePath(`/workspaces/${validated.data.workspace_id}`);
    revalidatePath(`/workspaces/${validated.data.workspace_id}/kanban`);
  }

  return { success: true, boardId: board.id };
}

export async function updateBoard(formData: UpdateBoardInput) {
  const validated = updateBoardSchema.safeParse(formData);

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

  // Ambil workspace_id sebelum update untuk keperluan log
  const { data: existing } = await supabase
    .from("boards")
    .select("workspace_id, title")
    .eq("id", validated.data.id)
    .single();

  const { error } = await supabase
    .from("boards")
    .update({
      title: validated.data.title,
      description: validated.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.data.id);

  if (error) {
    return { error: "Gagal update board" };
  }

  if (existing?.workspace_id) {
    await logActivity({
      workspace_id: existing.workspace_id,
      user_id: user.id,
      entity_type: "board",
      entity_id: validated.data.id,
      entity_title: validated.data.title,
      action: "updated",
    });
    revalidatePath(`/workspaces/${existing.workspace_id}`);
    revalidatePath(`/workspaces/${existing.workspace_id}/kanban`);
  }

  return { success: true };
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Ambil workspace_id + title sebelum hapus
  const { data: existing } = await supabase
    .from("boards")
    .select("workspace_id, title")
    .eq("id", boardId)
    .single();

  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", boardId);

  if (error) {
    return { error: "Gagal hapus board" };
  }

  if (existing?.workspace_id) {
    await logActivity({
      workspace_id: existing.workspace_id,
      user_id: user.id,
      entity_type: "board",
      entity_id: boardId,
      entity_title: existing.title,
      action: "deleted",
    });
    revalidatePath(`/workspaces/${existing.workspace_id}`);
  }

  return { success: true };
}
