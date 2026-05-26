-- Admin Security Enhancements
-- Run this AFTER 011_admin_sessions_audit.sql
-- Adds hashed token storage and improves security

-- Add column for hashed tokens (migrates from plaintext to hashed)
-- SECURITY: Store hashed tokens in DB, not plaintext (prevents session reuse if DB leaked)
DO $$
BEGIN
  -- Check if session_token_hash column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_sessions' 
    AND column_name = 'session_token_hash'
  ) THEN
    -- Add hashed token column
    ALTER TABLE public.admin_sessions 
    ADD COLUMN session_token_hash TEXT;
    
    -- Create index on hash for fast lookups
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash 
    ON public.admin_sessions(session_token_hash);
    
    -- Note: Existing sessions with plaintext tokens will need to be recreated
    -- They'll expire naturally. New sessions will use hashed tokens.
    -- The application code will handle both during migration period.
  END IF;
END $$;

-- Update audit log to ensure we don't accidentally log sensitive data
-- Add a check constraint to prevent logging full addresses/passwords
-- (This is enforced at application level, but good to document)

COMMENT ON TABLE public.admin_audit_log IS 
'Stores audit trail of admin actions. Does NOT store sensitive data like full addresses, passwords, or tokens. Only stores action metadata and resource IDs.';

COMMENT ON COLUMN public.admin_audit_log.details IS 
'JSONB field for action context. Should NOT contain sensitive data like full addresses, passwords, or tokens. Only metadata like field names changed, resource IDs, etc.';

-- Add function to clean up old audit logs (optional, for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 365)
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_audit_log
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

