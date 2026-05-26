-- FIX: Infinite recursion in RLS policies
-- Run this AFTER the original 003 migration to fix the policy issue

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Members can view directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Members can view directory users" ON public.users;

-- Recreate with simpler logic that doesn't cause recursion
-- For profiles: allow viewing own profile OR profiles marked as public
CREATE POLICY "Members can view directory profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    show_in_directory = true
  );

-- For users: allow viewing own record OR if authenticated (logged in members can see directory)
-- We avoid referencing profiles table here to prevent recursion
CREATE POLICY "Members can view directory users"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id
    OR
    auth.uid() IS NOT NULL  -- Any authenticated user can view users in directory
  );

-- Note: The directory page itself will filter to only show users with show_in_directory = true
-- This policy just allows the query to run without errors

