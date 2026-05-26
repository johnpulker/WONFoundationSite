-- Fix infinite recursion in users table RLS policies
-- The admin policies were querying the users table to check admin status,
-- which caused infinite recursion when checking policies

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage wonder women" ON public.wonder_women;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- Recreate admin policies using a function that checks auth.users metadata
-- This avoids querying the public.users table in the policy check

-- Create a helper function to check if user is admin
-- This function uses SECURITY DEFINER to bypass RLS when checking the role
-- It directly queries public.users without triggering RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use SECURITY DEFINER to bypass RLS and directly check the role
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'member') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Users can always view their own data
    OR
    public.is_admin(auth.uid())  -- Admins can view all
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id  -- Users can update their own data
    OR
    public.is_admin(auth.uid())  -- Admins can update all
  );

CREATE POLICY "Admins can manage memberships"
  ON public.memberships FOR ALL
  USING (
    auth.uid() = user_id  -- Users can manage their own membership
    OR
    public.is_admin(auth.uid())  -- Admins can manage all
  );

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (
    public.is_admin(auth.uid())  -- Only admins can manage events
  );

CREATE POLICY "Admins can manage wonder women"
  ON public.wonder_women FOR ALL
  USING (
    public.is_admin(auth.uid())  -- Only admins can manage wonder women
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = user_id  -- Users can view their own payments
    OR
    public.is_admin(auth.uid())  -- Admins can view all
  );

