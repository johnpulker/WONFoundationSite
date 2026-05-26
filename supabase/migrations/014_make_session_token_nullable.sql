-- Make session_token nullable to support hashed token migration
-- Once all sessions use hashed tokens, we can remove the plaintext column entirely
-- For now, we allow both: plaintext (legacy) or hash (new)

-- Make session_token nullable (hash column is preferred going forward)
ALTER TABLE public.admin_sessions 
  ALTER COLUMN session_token DROP NOT NULL;

-- Add a check constraint to ensure at least one token is present
-- (either session_token OR session_token_hash must be set)
ALTER TABLE public.admin_sessions 
  ADD CONSTRAINT check_token_exists 
  CHECK (session_token IS NOT NULL OR session_token_hash IS NOT NULL);

-- Note: This allows:
-- 1. Old sessions: session_token only (legacy)
-- 2. New sessions: session_token_hash only (preferred)
-- 3. Migration period: both (temporary, during migration)

