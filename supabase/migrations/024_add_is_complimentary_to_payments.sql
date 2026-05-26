-- Add is_complimentary column to payments table
-- This stores whether a payment was for a complimentary membership directly on the payment record
-- This is more reliable than trying to match payments to memberships by date

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS is_complimentary BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_is_complimentary 
  ON public.payments(is_complimentary) 
  WHERE is_complimentary = true;

-- Add comment for documentation
COMMENT ON COLUMN public.payments.is_complimentary IS 
  'Indicates if this payment was for a complimentary membership (not counted in revenue). Only applies to membership payments.';
