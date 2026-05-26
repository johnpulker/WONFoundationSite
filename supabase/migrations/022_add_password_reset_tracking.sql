-- Add password reset request tracking table
-- This allows us to enforce our own 1-hour expiration window
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email 
ON public.password_reset_requests(email, requested_at DESC);

-- Index for cleanup of old requests
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_requested_at 
ON public.password_reset_requests(requested_at);

-- Add comment
COMMENT ON TABLE public.password_reset_requests IS 'Tracks password reset requests to enforce 1-hour expiration window';
