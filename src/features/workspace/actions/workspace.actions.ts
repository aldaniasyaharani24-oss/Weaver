"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../validation/workspace.schema";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../validation/workspace.schema";
import {
  createNewWorkspace,
  editWorkspace,
  removeWorkspace,
} from "../services/workspace.service";

export async function createWorkspaceAction(formData: CreateWorkspaceInput) {
  const validated = createWorkspaceSchema.safeParse(formData);

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

  try {
    await createNewWorkspace(
      {
        owner_id: user.id,
        name: validated.data.name,
        description: validated.data.description ?? null,
        icon: validated.data.icon ?? null,
        color: validated.data.color ?? "#6366f1",
      },
      user.id,
    );

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");
    return { success: true };
  } catch (err: any) {
    console.error("createWorkspaceAction error:", err);
    return { error: err.message || "Gagal membuat workspace" };
  }
}

export async function updateWorkspaceAction(formData: UpdateWorkspaceInput) {
  const validated = updateWorkspaceSchema.safeParse(formData);

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

  try {
    await editWorkspace(
      validated.data.id,
      {
        name: validated.data.name,
        description: validated.data.description,
        icon: validated.data.icon,
        color: validated.data.color,
      },
      user.id,
    );

    revalidatePath("/workspaces");
    revalidatePath(`/workspaces/${validated.data.id}`);
    return { success: true };
  } catch {
    return { error: "Gagal update workspace" };
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await removeWorkspace(workspaceId, user.id);
    revalidatePath("/workspaces");
    return { success: true };
  } catch {
    return { error: "Gagal menghapus workspace" };
  }
}
