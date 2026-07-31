-- ============================================================
-- Migration 004: Fix invite member dengan SECURITY DEFINER function
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Drop policy INSERT yang bermasalah (circular dependency)
DROP POLICY IF EXISTS "wm_insert_owner_admin" ON public.workspace_members;

-- Buat policy INSERT yang lebih sederhana:
-- Hanya allow insert diri sendiri sebagai owner (saat buat workspace)
-- Invite orang lain dilakukan via function SECURITY DEFINER
CREATE POLICY "wm_insert_self_as_owner" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'owner'
  );

-- Function untuk invite member (bypass RLS)
-- SECURITY DEFINER = berjalan dengan hak akses superuser, bisa bypass RLS
CREATE OR REPLACE FUNCTION public.invite_workspace_member(
  p_workspace_id  UUID,
  p_user_id       UUID,
  p_role          workspace_role DEFAULT 'member'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_role workspace_role;
BEGIN
  -- Cek apakah pemanggil adalah owner atau admin di workspace ini
  SELECT role INTO v_requester_role
  FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid();

  IF v_requester_role IS NULL THEN
    RAISE EXCEPTION 'Anda bukan anggota workspace ini';
  END IF;

  IF v_requester_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Hanya owner atau admin yang bisa mengundang anggota';
  END IF;

  -- Cek apakah user sudah jadi member
  IF EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Pengguna sudah menjadi anggota workspace ini';
  END IF;

  -- Insert member baru
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (p_workspace_id, p_user_id, p_role);
END;
$$;

-- Berikan akses ke authenticated users
GRANT EXECUTE ON FUNCTION public.invite_workspace_member(UUID, UUID, workspace_role) TO authenticated;

-- ============================================================
-- Verifikasi:
-- SELECT public.invite_workspace_member(
--   'workspace-id-uuid',
--   'user-id-uuid',
--   'member'
-- );
-- ============================================================
