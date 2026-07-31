-- ============================================================
-- Migration 003: Fungsi get_user_id_by_email
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Tambah kolom email ke tabel profiles jika belum ada
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Isi kolom email dari auth.users untuk semua profil yang sudah ada
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Trigger: otomatis isi email saat user baru daftar
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_email ON auth.users;
CREATE TRIGGER trg_sync_profile_email
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();

-- RPC function untuk cari user by email
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS TABLE (user_id UUID, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id          AS user_id,
    p.full_name   AS full_name
  FROM public.profiles p
  WHERE p.email = user_email
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;

-- ============================================================
-- Verifikasi:
--   SELECT email FROM public.profiles LIMIT 5;
--   SELECT * FROM public.get_user_id_by_email('test@email.com');
-- ============================================================
