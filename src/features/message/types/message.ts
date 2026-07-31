export interface Message {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessageWithAuthor extends Message {
  author_name: string | null;
  author_avatar: string | null;
}

export interface MessageComment {
  id: string;
  message_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface MessageCommentWithAuthor extends MessageComment {
  author_name: string | null;
  author_avatar: string | null;
}
