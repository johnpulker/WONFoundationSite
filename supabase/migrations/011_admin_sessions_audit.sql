-- Admin session and audit logging tables
-- Provides secure server-side session management and audit trails

-- Admin sessions table (DB-backed sessions)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'VIEW', 'UPDATE', 'DELETE', 'CREATE'
  resource_type TEXT, -- 'members', 'events', 'payments', etc.
  resource_id TEXT, -- ID of the resource accessed
  ip_address TEXT,
  user_agent TEXT,
  details JSONB, -- Additional context (what was changed, etc.)
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_timestamp ON public.admin_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_session ON public.admin_audit_log(session_id);

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS policies (admin sessions should only be accessible server-side)
-- NOTE: These tables are accessed via service role key, which bypasses RLS
-- We disable RLS entirely since service role has full access anyway
-- Security comes from:
-- 1. Service role key is server-side only (never exposed to client)
-- 2. Session tokens are cryptographically random
-- 3. Expiration is enforced
-- 4. HttpOnly cookies prevent XSS attacks

ALTER TABLE public.admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log DISABLE ROW LEVEL SECURITY;

