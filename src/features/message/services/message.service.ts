import {
  getMessagesByWorkspace,
  getMessageById,
  getMessageComments,
  createMessage,
  createComment,
  deleteMessage,
  deleteComment,
} from "../repository/message.repository";
import type { MessageWithAuthor, MessageCommentWithAuthor } from "../types/message";
import { recordActivity } from "@/features/workspace/services/activity.service";

export async function listMessages(workspaceId: string): Promise<MessageWithAuthor[]> {
  return getMessagesByWorkspace(workspaceId);
}

export async function getMessageDetail(
  messageId: string
): Promise<{ message: MessageWithAuthor; comments: MessageCommentWithAuthor[] } | null> {
  const message = await getMessageById(messageId);
  if (!message) return null;

  const comments = await getMessageComments(messageId);
  return { message, comments };
}

export async function postNewMessage(
  workspaceId: string,
  userId: string,
  title: string,
  content: string
): Promise<string> {
  const message = await createMessage({
    workspace_id: workspaceId,
    user_id: userId,
    title,
    content,
  });

  // Log activity
  await recordActivity({
    workspace_id: workspaceId,
    user_id: userId,
    action: "created",
    entity_type: "message",
    entity_id: message.id,
    entity_title: title,
  }).catch((err) => console.error("Failed to log activity for message:", err));

  return message.id;
}

export async function postComment(
  workspaceId: string,
  messageId: string,
  userId: string,
  content: string
): Promise<void> {
  await createComment(messageId, userId, content);

  // Optional: log activity for comment
  await recordActivity({
    workspace_id: workspaceId,
    user_id: userId,
    action: "created",
    entity_type: "comment",
    entity_id: messageId, // Using messageId as reference
    entity_title: "komentar",
  }).catch((err) => console.error("Failed to log activity for comment:", err));
}

export async function removeMessage(messageId: string): Promise<void> {
  await deleteMessage(messageId);
}

export async function removeComment(commentId: string): Promise<void> {
  await deleteComment(commentId);
}
