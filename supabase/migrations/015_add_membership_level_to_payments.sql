-- Add membership_level column to payments table
-- This allows us to track which membership level was purchased in payment records

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS membership_level TEXT 
  CHECK (membership_level IS NULL OR membership_level IN ('General', 'Sustaining', 'Youth'));

-- Add index for faster queries by membership level
CREATE INDEX IF NOT EXISTS idx_payments_membership_level 
  ON public.payments(membership_level) 
  WHERE membership_level IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.payments.membership_level IS 
  'Membership level purchased (General, Sustaining, or Youth). Only populated for payments with type="membership".';

