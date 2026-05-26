-- Enhanced Member Profiles Migration
-- Adds fields for member directory and privacy controls
-- 
-- SAFE TO RUN: This migration is designed to be idempotent (can run multiple times safely)
-- The DROP TRIGGER is intentional - we recreate it with an updated function

-- =====================================================
-- STEP 1: Add new columns to existing tables
-- =====================================================

-- Add new columns to profiles table (IF NOT EXISTS ensures safety)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_email_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_in_directory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add first_name and last_name to users for alphabetical sorting in directory
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- =====================================================
-- STEP 2: Create indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_last_name ON public.users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON public.users(first_name);

-- =====================================================
-- STEP 3: Add Row Level Security Policies for Directory
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts), then recreate
DROP POLICY IF EXISTS "Members can view directory profiles" ON public.profiles;
DROP POLICY IF EXISTS "Members can view directory users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user record" ON public.users;

-- Policy for members to view other members in directory (only if show_in_directory is true)
CREATE POLICY "Members can view directory profiles"
  ON public.profiles FOR SELECT
  USING (
    show_in_directory = true
    OR
    auth.uid() = id
  );

-- Policy for members to view other users' basic info in directory
CREATE POLICY "Members can view directory users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = users.id AND profiles.show_in_directory = true
    )
    OR
    auth.uid() = id
  );

-- Allow users to insert their own user record (for signup)
CREATE POLICY "Users can insert their own user record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 4: Create function and trigger for auto-signup
-- =====================================================

-- Function to handle new user signup (CREATE OR REPLACE is safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Insert into public.profiles with defaults
  INSERT INTO public.profiles (id, show_in_directory, show_email_public, show_phone_public)
  VALUES (NEW.id, true, false, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger (this is intentional and safe)
-- The trigger auto-creates user and profile records when someone signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 5: Ensure updated_at trigger exists for profiles
-- =====================================================

-- This may already exist from migration 001, so we drop first to avoid errors
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! 
-- 
-- Next steps after running this migration:
-- 1. Create a storage bucket called "profile-photos" in Supabase Dashboard
--    (Storage → New bucket → name: profile-photos, public: true)
-- =====================================================
