"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createMessageSchema, createCommentSchema } from "../validation/message.schema";
import type { CreateMessageInput, CreateCommentInput } from "../validation/message.schema";
import { postNewMessage, postComment, removeMessage, removeComment } from "../services/message.service";

export async function createMessageAction(formData: CreateMessageInput) {
  const validated = createMessageSchema.safeParse(formData);

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
    const messageId = await postNewMessage(
      validated.data.workspaceId,
      user.id,
      validated.data.title,
      validated.data.content
    );

    revalidatePath(`/workspaces/${validated.data.workspaceId}`);
    revalidatePath(`/workspaces/${validated.data.workspaceId}/messages`);
    return { success: true, messageId };
  } catch (err: any) {
    console.error("createMessageAction error:", err);
    return { error: err.message || "Gagal membuat pesan" };
  }
}

export async function deleteMessageAction(messageId: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await removeMessage(messageId);
    revalidatePath(`/workspaces/${workspaceId}`);
    revalidatePath(`/workspaces/${workspaceId}/messages`);
    return { success: true };
  } catch (err: any) {
    console.error("deleteMessageAction error:", err);
    return { error: err.message || "Gagal menghapus pesan" };
  }
}

export async function createCommentAction(formData: CreateCommentInput, workspaceId: string) {
  const validated = createCommentSchema.safeParse(formData);

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
    await postComment(workspaceId, validated.data.messageId, user.id, validated.data.content);

    revalidatePath(`/workspaces/${workspaceId}/messages/${validated.data.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error("createCommentAction error:", err);
    return { error: err.message || "Gagal mengirim komentar" };
  }
}

export async function deleteCommentAction(commentId: string, workspaceId: string, messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await removeComment(commentId);
    revalidatePath(`/workspaces/${workspaceId}/messages/${messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error("deleteCommentAction error:", err);
    return { error: err.message || "Gagal menghapus komentar" };
  }
}
