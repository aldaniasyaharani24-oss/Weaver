-- ============================================
-- 1. TABEL MESSAGES (PAPAN PESAN / PENGUMUMAN)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Buat index untuk pencarian lebih cepat berdasarkan workspace
CREATE INDEX IF NOT EXISTS idx_messages_workspace_id ON messages(workspace_id);

-- ============================================
-- 2. TABEL MESSAGE_COMMENTS (KOMENTAR PESAN)
-- ============================================
CREATE TABLE IF NOT EXISTS message_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_message_comments_message_id ON message_comments(message_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_comments ENABLE ROW LEVEL SECURITY;

-- MESSAGES POLICIES
-- Anggota workspace bisa melihat pesan di workspace-nya
CREATE POLICY "Messages select policy"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = messages.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Anggota workspace bisa membuat pesan
CREATE POLICY "Messages insert policy"
  ON messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Penulis pesan atau owner workspace bisa menghapus/mengubah (disini penulis saja untuk MVP)
CREATE POLICY "Messages update policy"
  ON messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Messages delete policy"
  ON messages FOR DELETE
  USING (user_id = auth.uid());

-- MESSAGE COMMENTS POLICIES
-- Kita gunakan pendekatan sederhana: User bisa membaca komentar jika bisa membaca pesannya (karena kita sudah membatasi messages)
CREATE POLICY "Comments select policy"
  ON message_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_comments.message_id
    )
  );

-- Anggota workspace (yang bisa akses pesan) bisa membuat komentar
CREATE POLICY "Comments insert policy"
  ON message_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_id
    )
  );

CREATE POLICY "Comments delete policy"
  ON message_comments FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 4. VIEWS (UNTUK MENDAPATKAN NAMA PENULIS)
-- ============================================
CREATE OR REPLACE VIEW messages_with_author AS
SELECT 
  m.id,
  m.workspace_id,
  m.user_id,
  m.title,
  m.content,
  m.created_at,
  m.updated_at,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar
FROM messages m
JOIN profiles p ON m.user_id = p.id;

CREATE OR REPLACE VIEW message_comments_with_author AS
SELECT 
  c.id,
  c.message_id,
  c.user_id,
  c.content,
  c.created_at,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar
FROM message_comments c
JOIN profiles p ON c.user_id = p.id;
