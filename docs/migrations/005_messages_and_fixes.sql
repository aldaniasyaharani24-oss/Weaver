-- ============================================================
-- Migration 005: Messages, Comments, + Fixes
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Tabel: messages
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_workspace_id ON public.messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at   ON public.messages(created_at DESC);

-- ─────────────────────────────────────────
-- 2. Tabel: message_comments
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_comments_message_id ON public.message_comments(message_id);

-- ─────────────────────────────────────────
-- 3. RLS: messages
-- ─────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_select_member" ON public.messages;
DROP POLICY IF EXISTS "msg_insert_member" ON public.messages;
DROP POLICY IF EXISTS "msg_delete_owner"  ON public.messages;

CREATE POLICY "msg_select_member" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = messages.workspace_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "msg_insert_member" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = messages.workspace_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "msg_delete_owner" ON public.messages
  FOR DELETE USING (user_id = auth.uid());

-- ─────────────────────────────────────────
-- 4. RLS: message_comments
-- ─────────────────────────────────────────
ALTER TABLE public.message_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mc_select_member" ON public.message_comments;
DROP POLICY IF EXISTS "mc_insert_member" ON public.message_comments;
DROP POLICY IF EXISTS "mc_delete_owner"  ON public.message_comments;

CREATE POLICY "mc_select_member" ON public.message_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = message_comments.message_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "mc_insert_member" ON public.message_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "mc_delete_owner" ON public.message_comments
  FOR DELETE USING (user_id = auth.uid());

-- ─────────────────────────────────────────
-- 5. View: messages_with_author
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.messages_with_author AS
  SELECT
    m.id,
    m.workspace_id,
    m.user_id,
    m.title,
    m.content,
    m.created_at,
    m.updated_at,
    p.full_name  AS author_name,
    p.avatar_url AS author_avatar
  FROM public.messages m
  LEFT JOIN public.profiles p ON p.id = m.user_id;

-- ─────────────────────────────────────────
-- 6. View: message_comments_with_author
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.message_comments_with_author AS
  SELECT
    mc.id,
    mc.message_id,
    mc.user_id,
    mc.content,
    mc.created_at,
    p.full_name  AS author_name,
    p.avatar_url AS author_avatar
  FROM public.message_comments mc
  LEFT JOIN public.profiles p ON p.id = mc.user_id;

-- ─────────────────────────────────────────
-- 7. Trigger: auto-update updated_at di messages
-- ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- 8. Fix activity_logs join ke workspaces
--    Pastikan foreign key ada untuk join .workspaces
-- ─────────────────────────────────────────
-- (FK sudah ada dari CREATE TABLE, hanya perlu pastikan)
-- Jika join error, gunakan query tanpa join workspace:

-- ─────────────────────────────────────────
-- SELESAI
-- Verifikasi:
--   SELECT * FROM public.messages LIMIT 5;
--   SELECT * FROM public.messages_with_author LIMIT 5;
--   SELECT * FROM public.message_comments_with_author LIMIT 5;
-- ─────────────────────────────────────────
