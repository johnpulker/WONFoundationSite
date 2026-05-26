-- Fix: Make session_token nullable so we can use only session_token_hash
-- This allows the new secure approach (hash only) without requiring plaintext token

-- Make session_token nullable
ALTER TABLE public.admin_sessions 
ALTER COLUMN session_token DROP NOT NULL;

-- Note: This allows inserts with only session_token_hash (more secure)
-- Old sessions with plaintext tokens will still work during migration period

