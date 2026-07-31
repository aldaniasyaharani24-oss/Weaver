-- ============================================================
-- Migration: Phase 2 – Workspace
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Tabel: workspaces
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk query by owner
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

-- ─────────────────────────────────────────
-- 2. Tabel: workspace_members
-- ─────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         workspace_role NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id      ON public.workspace_members(user_id);

-- ─────────────────────────────────────────
-- 3. Tambah kolom workspace_id ke boards
-- ─────────────────────────────────────────
ALTER TABLE public.boards
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_boards_workspace_id ON public.boards(workspace_id);

-- ─────────────────────────────────────────
-- 4. Trigger: auto-update updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- 5. Row Level Security (RLS)
-- ─────────────────────────────────────────

-- workspaces: user hanya bisa lihat workspace yang dia ikut sebagai member
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select_member"  ON public.workspaces;
DROP POLICY IF EXISTS "workspace_insert_owner"   ON public.workspaces;
DROP POLICY IF EXISTS "workspace_update_owner"   ON public.workspaces;
DROP POLICY IF EXISTS "workspace_delete_owner"   ON public.workspaces;

CREATE POLICY "workspace_select_member" ON public.workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_insert_owner" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspace_update_owner" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspace_delete_owner" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- workspace_members: member bisa lihat member lain di workspace yang sama
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wm_select_same_workspace" ON public.workspace_members;
DROP POLICY IF EXISTS "wm_insert_owner_admin"    ON public.workspace_members;
DROP POLICY IF EXISTS "wm_delete_owner_admin"    ON public.workspace_members;

CREATE POLICY "wm_select_same_workspace" ON public.workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS me
      WHERE me.workspace_id = workspace_members.workspace_id
        AND me.user_id = auth.uid()
    )
  );

CREATE POLICY "wm_insert_owner_admin" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS me
      WHERE me.workspace_id = workspace_members.workspace_id
        AND me.user_id = auth.uid()
        AND me.role IN ('owner', 'admin')
    )
    OR (
      -- allow creator to insert themselves as owner on workspace creation
      workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
    )
  );

CREATE POLICY "wm_delete_owner_admin" ON public.workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS me
      WHERE me.workspace_id = workspace_members.workspace_id
        AND me.user_id = auth.uid()
        AND me.role IN ('owner', 'admin')
    )
  );

-- ─────────────────────────────────────────
-- SELESAI
-- Cek hasil:
--   SELECT * FROM public.workspaces LIMIT 5;
--   SELECT * FROM public.workspace_members LIMIT 5;
--   \d public.boards   -- pastikan kolom workspace_id muncul
-- ─────────────────────────────────────────
