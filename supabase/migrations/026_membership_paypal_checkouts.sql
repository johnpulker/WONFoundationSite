-- Tracks server-created PayPal membership checkout orders for reuse and audit.
CREATE TABLE IF NOT EXISTS public.membership_paypal_checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paypal_order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  membership_level TEXT NOT NULL CHECK (membership_level IN ('General', 'Sustaining', 'Youth')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '45 minutes')
);

CREATE INDEX IF NOT EXISTS idx_membership_paypal_checkouts_user_pending
  ON public.membership_paypal_checkouts(user_id, membership_level, status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_membership_paypal_checkouts_guest_pending
  ON public.membership_paypal_checkouts(guest_email, membership_level, status)
  WHERE status = 'pending' AND guest_email IS NOT NULL;

COMMENT ON TABLE public.membership_paypal_checkouts IS
  'Server-issued PayPal membership orders; pending rows may be reused to reduce duplicate checkout attempts.';
