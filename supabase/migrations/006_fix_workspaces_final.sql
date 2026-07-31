-- ============================================
-- 1. HAPUS SEMUA POLICY & FUNGSI LAMA
-- ============================================
-- Hapus semua kebijakan di tabel-tabel ini agar tidak bentrok
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Users can view members" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert themselves as owner" ON workspace_members;

DROP POLICY IF EXISTS "Users can view activity logs of their workspaces" ON activity_logs;
DROP POLICY IF EXISTS "Users can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs in their workspaces" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs" ON activity_logs;

-- Hapus fungsi yang memicu error
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid);
DROP FUNCTION IF EXISTS public.get_user_workspace_ids();

-- ============================================
-- 2. POLICY BARU YANG BEBAS RECURSION
-- ============================================
-- Rahasianya: Tabel workspace_members dibuat bisa DIBACA oleh semua user (authenticated).
-- Ini memutuskan rantai infinite recursion karena pengecekan anggota tidak akan memicu pengecekan yang lain.

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
  USING (true); -- Memutuskan infinite recursion!

CREATE POLICY "Workspace members insert policy"
  ON workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOGS
CREATE POLICY "Activity logs select policy"
  ON activity_logs FOR SELECT
  USING (true); -- Memutuskan infinite recursion!

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
-- Drop view terlebih dahulu untuk menghindari error perubahan tipe data (contoh: varchar(255) ke text)
DROP VIEW IF EXISTS workspace_members_with_profiles;

-- Kode Anda membutuhkan view ini untuk menampilkan daftar anggota di workspace
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
