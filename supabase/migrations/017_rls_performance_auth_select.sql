-- RLS performance: wrap auth.uid() and auth-calling functions in (select ...)
-- So Postgres evaluates once per query instead of per row. See:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- =============================================================================
-- USERS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Members can view directory users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user record" ON public.users;

CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    (select auth.uid()) = id
    OR public.is_admin((select auth.uid()))
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    (select auth.uid()) = id
    OR public.is_admin((select auth.uid()))
  );

CREATE POLICY "Members can view directory users"
  ON public.users FOR SELECT
  USING (
    (select auth.uid()) = id
    OR (select auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can insert their own user record"
  ON public.users FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- =============================================================================
-- PROFILES
-- =============================================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Members can view directory profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Members can view directory profiles"
  ON public.profiles FOR SELECT
  USING (
    (select auth.uid()) = id
    OR show_in_directory = true
  );

-- =============================================================================
-- MEMBERSHIPS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view their own membership" ON public.memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;

CREATE POLICY "Users can view their own membership"
  ON public.memberships FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can manage memberships"
  ON public.memberships FOR ALL
  USING (
    (select auth.uid()) = user_id
    OR public.is_admin((select auth.uid()))
  );

-- =============================================================================
-- PAYMENTS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR public.is_admin((select auth.uid()))
  );

-- =============================================================================
-- EVENTS
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (public.is_admin((select auth.uid())));

-- =============================================================================
-- WONDER_WOMEN
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage wonder women" ON public.wonder_women;

CREATE POLICY "Admins can manage wonder women"
  ON public.wonder_women FOR ALL
  USING (public.is_admin((select auth.uid())));
