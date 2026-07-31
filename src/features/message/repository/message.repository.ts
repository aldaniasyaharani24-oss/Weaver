import { createClient } from "@/lib/supabase/server";
import type { Message, MessageWithAuthor, MessageCommentWithAuthor } from "../types/message";

export async function getMessagesByWorkspace(workspaceId: string): Promise<MessageWithAuthor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages_with_author")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as MessageWithAuthor[];
}

export async function getMessageById(messageId: string): Promise<MessageWithAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages_with_author")
    .select("*")
    .eq("id", messageId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as MessageWithAuthor;
}

export async function getMessageComments(messageId: string): Promise<MessageCommentWithAuthor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("message_comments_with_author")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as MessageCommentWithAuthor[];
}

export async function createMessage(
  payload: Omit<Message, "id" | "created_at" | "updated_at">
): Promise<Message> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating message:", error);
    throw new Error(error?.message || "Gagal membuat pesan");
  }

  return data as Message;
}

export async function createComment(
  messageId: string,
  userId: string,
  content: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_comments")
    .insert({
      message_id: messageId,
      user_id: userId,
      content,
    });

  if (error) {
    console.error("Error creating comment:", error);
    throw new Error(error.message || "Gagal membuat komentar");
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting message:", error);
    throw new Error(error.message || "Gagal menghapus pesan");
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    throw new Error(error.message || "Gagal menghapus komentar");
  }
}
