-- Supabase Security Advisor fixes
-- Addresses: RLS on admin tables, function search_path hardening

-- =============================================================================
-- 1. Enable RLS on admin_sessions and admin_audit_log
-- =============================================================================
-- With RLS enabled and NO permissive policies for anon/authenticated,
-- the PostgREST API returns no rows for these tables. Service role bypasses RLS,
-- so server-side code (createAdminClient) continues to work.

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- No policies = no access for anon or authenticated. Service role is unaffected.

-- =============================================================================
-- 2. Fix function search_path (prevents search_path injection)
-- =============================================================================

-- is_admin (used by RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;
  RETURN COALESCE(user_role, 'member') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- cleanup_expired_admin_sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- cleanup_old_audit_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 365)
RETURNS void
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_audit_log
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- handle_new_user (references auth.users via trigger - auth schema is implicit)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  INSERT INTO public.profiles (id, show_in_directory, show_email_public, show_phone_public)
  VALUES (NEW.id, true, false, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_board_members_updated_at
CREATE OR REPLACE FUNCTION public.update_board_members_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- update_gallery_photos_updated_at
CREATE OR REPLACE FUNCTION public.update_gallery_photos_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. HaveIBeenPwned (compromised password check) - DASHBOARD ONLY
-- =============================================================================
-- Enable in Supabase: Authentication → Settings → Security →
-- "Check passwords against HaveIBeenPwned" to block compromised passwords.
