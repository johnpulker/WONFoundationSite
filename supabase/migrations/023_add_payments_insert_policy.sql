-- Add INSERT policies for payments table
-- Users need to be able to insert their own payment records (for check payments, etc.)
-- Admins can insert payments for any user

-- =============================================================================
-- PAYMENTS - INSERT POLICIES
-- =============================================================================

-- Allow users to insert their own payment records
CREATE POLICY "Users can insert their own payments"
  ON public.payments FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Allow admins to insert payments for any user
CREATE POLICY "Admins can insert all payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.is_admin((select auth.uid())));
