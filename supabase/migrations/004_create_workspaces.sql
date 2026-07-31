-- ============================================
-- 4. WORKSPACES
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- 5. WORKSPACE_MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- ============================================
-- 6. ACTIVITY_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'board', 'workspace', 'member')),
  entity_id UUID,
  entity_title TEXT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'moved', 'invited', 'removed', 'completed')),
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- ALTER BOARDS TABLE
-- ============================================
-- Tambahkan workspace_id ke boards jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='boards' AND column_name='workspace_id'
  ) THEN
    ALTER TABLE boards ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
  END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR WORKSPACES
-- ============================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Buat fungsi helper (Security Definer) untuk mengecek apakah user adalah member dari suatu workspace
-- Ini sangat penting untuk menghindari error "infinite recursion" saat RLS saling memanggil
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces Policies
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  USING ( auth.uid() = owner_id OR public.is_workspace_member(id) );

DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update workspaces" ON workspaces;
CREATE POLICY "Owners can update workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- Workspace Members Policies
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
CREATE POLICY "Users can view members of their workspaces"
  ON workspace_members FOR SELECT
  USING ( public.is_workspace_member(workspace_id) );

DROP POLICY IF EXISTS "Users can insert themselves as owner" ON workspace_members;
CREATE POLICY "Users can insert themselves as owner"
  ON workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity Logs Policies
DROP POLICY IF EXISTS "Users can view activity logs of their workspaces" ON activity_logs;
CREATE POLICY "Users can view activity logs of their workspaces"
  ON activity_logs FOR SELECT
  USING ( public.is_workspace_member(workspace_id) );

DROP POLICY IF EXISTS "Users can insert activity logs in their workspaces" ON activity_logs;
CREATE POLICY "Users can insert activity logs in their workspaces"
  ON activity_logs FOR INSERT
  WITH CHECK ( public.is_workspace_member(workspace_id) );
