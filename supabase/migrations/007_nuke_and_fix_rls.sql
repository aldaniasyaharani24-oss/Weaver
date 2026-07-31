-- ============================================
-- 1. HAPUS SEMUA POLICY SECARA DINAMIS (NUKE)
-- ============================================
-- Script ini akan mencari dan menghapus SEMUA policy yang ada di tabel-tabel 
-- workspace_members, workspaces, dan activity_logs, apa pun namanya.
DO $$ 
DECLARE 
    r record;
BEGIN
    -- Nuke policies on workspace_members
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'workspace_members' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON workspace_members';
    END LOOP;
    
    -- Nuke policies on workspaces
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'workspaces' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON workspaces';
    END LOOP;
    
    -- Nuke policies on activity_logs
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'activity_logs' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON activity_logs';
    END LOOP;
END $$;

-- Hapus juga function lama jika masih ada
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid);
DROP FUNCTION IF EXISTS public.get_user_workspace_ids();

-- ============================================
-- 2. POLICY BARU YANG BEBAS RECURSION
-- ============================================

-- WORKSPACES
CREATE POLICY "Workspaces select policy"
  ON workspaces FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspaces insert policy"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspaces update policy"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces delete policy"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- WORKSPACE MEMBERS
CREATE POLICY "Workspace members select policy"
  ON workspace_members FOR SELECT
  USING (true); 

CREATE POLICY "Workspace members insert policy"
  ON workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOGS
CREATE POLICY "Activity logs select policy"
  ON activity_logs FOR SELECT
  USING (true); 

CREATE POLICY "Activity logs insert policy"
  ON activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = activity_logs.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. BUAT VIEW UNTUK MEMBER DENGAN PROFIL
-- ============================================
DROP VIEW IF EXISTS workspace_members_with_profiles;

CREATE VIEW workspace_members_with_profiles AS
SELECT 
  wm.id,
  wm.workspace_id,
  wm.user_id,
  wm.role,
  wm.joined_at,
  p.full_name,
  p.avatar_url,
  p.email
FROM workspace_members wm
JOIN profiles p ON wm.user_id = p.id;
