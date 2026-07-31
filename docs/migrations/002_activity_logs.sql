-- ============================================================
-- Migration: Activity Logs + Members Profile View
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Tabel: activity_logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type  TEXT NOT NULL,  -- 'task' | 'board' | 'workspace' | 'member'
  entity_id    TEXT,           -- id dari entitas yang diubah
  entity_title TEXT,           -- judul/nama entitas (snapshot saat aksi)
  action       TEXT NOT NULL,  -- 'created' | 'updated' | 'deleted' | 'moved' | 'invited' | 'removed'
  meta         JSONB,          -- data tambahan (misal: from_status, to_status)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace_id ON public.activity_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id      ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at   ON public.activity_logs(created_at DESC);

-- ─────────────────────────────────────────
-- 2. RLS untuk activity_logs
-- ─────────────────────────────────────────
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "al_select_member" ON public.activity_logs;
DROP POLICY IF EXISTS "al_insert_member" ON public.activity_logs;

-- Member workspace bisa lihat semua log di workspace tersebut
CREATE POLICY "al_select_member" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = activity_logs.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Member workspace bisa insert log
CREATE POLICY "al_insert_member" ON public.activity_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = activity_logs.workspace_id
        AND user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 3. View: workspace_members_with_profiles
--    Join workspace_members dengan profiles agar
--    bisa query nama + email anggota sekaligus
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.workspace_members_with_profiles AS
  SELECT
    wm.id,
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.joined_at,
    p.full_name,
    p.avatar_url,
    u.email
  FROM public.workspace_members wm
  JOIN public.profiles p ON p.id = wm.user_id
  JOIN auth.users u ON u.id = wm.user_id;

-- ─────────────────────────────────────────
-- SELESAI
-- ─────────────────────────────────────────
