-- Hapus kebijakan yang berpotensi menyebabkan infinite recursion
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Users can view activity logs of their workspaces" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs in their workspaces" ON activity_logs;

-- Hapus fungsi lama
DROP FUNCTION IF EXISTS public.is_workspace_member(uuid);

-- 1. Buat fungsi Security Definer baru yang me-return daftar workspace_id milik user
-- Dengan cara ini, Postgres tidak perlu melakukan pengecekan RLS berulang kali
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY 
  SELECT workspace_id FROM public.workspace_members 
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Pasang ulang Policy untuk Workspaces
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    auth.uid() = owner_id OR 
    id IN (SELECT public.get_user_workspace_ids())
  );

-- 3. Pasang ulang Policy untuk Workspace Members
CREATE POLICY "Users can view members"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (SELECT public.get_user_workspace_ids())
  );

-- 4. Pasang ulang Policy untuk Activity Logs
CREATE POLICY "Users can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    workspace_id IN (SELECT public.get_user_workspace_ids())
  );

CREATE POLICY "Users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT public.get_user_workspace_ids())
  );
