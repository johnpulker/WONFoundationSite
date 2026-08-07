-- Fix payments table to support sponsorship purchases
-- 1. Add 'sponsorship' to the type CHECK constraint
-- 2. Remove the hard restriction on membership_level (free-text for all payment types)
-- 3. Add payer_name and payer_email for capturing PayPal buyer info on guest checkouts

-- Step 1: Update type CHECK constraint to include 'sponsorship'
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_type_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_type_check
  CHECK (type IN ('membership', 'donation', 'ticket', 'sponsorship'));

-- Step 2: Remove the restrictive membership_level CHECK constraint so it accepts
--         sponsorship tier names (SHERO, HERSTORY, LEADING LADY, GIRL POWER)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_membership_level_check;
-- No replacement constraint — membership_level is now free-text

-- Step 3: Add columns to capture PayPal payer info for guest (non-logged-in) buyers
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payer_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payer_email TEXT;

-- Index for quick sponsor lookups by type
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(type);

COMMENT ON COLUMN public.payments.payer_name IS
  'Full name from PayPal payer details — populated when buyer is not logged in';
COMMENT ON COLUMN public.payments.payer_email IS
  'Email from PayPal payer details — populated when buyer is not logged in';
