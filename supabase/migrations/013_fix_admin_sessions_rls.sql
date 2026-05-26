-- Fix RLS policies for admin_sessions and admin_audit_log
-- The previous migration had policies that blocked all access
-- Since we use service role key (which bypasses RLS), we disable RLS entirely

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage admin sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.admin_audit_log;

-- Disable RLS (service role bypasses it anyway, and we don't want any blocking)
ALTER TABLE public.admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log DISABLE ROW LEVEL SECURITY;

-- Note: These tables are accessed via service role key, which bypasses RLS
-- Security comes from:
-- 1. Service role key is server-side only (never exposed to client)
-- 2. Session tokens are cryptographically random
-- 3. Expiration is enforced
-- 4. HttpOnly cookies prevent XSS attacks

